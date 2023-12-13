// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {PublicMintStage, AllowlistMintStage, AllowlistMintStageConfig, TokenGatedMintStage, TokenGatedMintStageConfig} from "./lib/DropStructs.sol";

import {AdministratedUpgradeable} from "./core/AdministratedUpgradeable.sol";
import {ERC1155Metadata} from "./core/ERC1155Metadata.sol";
import {Payout} from "./core/Payout.sol";
import {IERC1155EditionsImplementation} from "./interface/IERC1155EditionsImplementation.sol";

contract ERC1155EditionsImplementation is
    AdministratedUpgradeable,
    ERC1155Metadata,
    Payout,
    ReentrancyGuardUpgradeable,
    IERC1155EditionsImplementation
{
    mapping(uint256 tokenId =>
        PublicMintStage publicMintStage) public publicMintStages;

    mapping(uint256 tokenId =>
        mapping(uint256 allowlistStageId => AllowlistMintStage allowlistMintStage)) public allowlistMintStages;

    mapping(uint256 tokenId =>
        mapping(address nftContract => TokenGatedMintStage mintStage)) public tokenGatedMintStages;

    mapping(uint256 tokenId =>
        mapping(address nftContract => mapping(uint256 nftContractTokenId => bool redeemed))) private _tokenGatedTokenRedeems;

    mapping(uint256 tokenId =>
        mapping(address minter => mapping(address nftContract => mapping(uint256 nftContractTokenId => bool redeemed)))) private _tokenHolderRedeemed;

    uint256 internal constant PUBLIC_STAGE_INDEX = 0;
    uint256 internal constant ALLOWLIST_STAGE_INDEX = 1;
    uint256 internal constant TOKEN_GATED_STAGE_INDEX = 2;

    uint256 internal constant UNLIMITED_MAX_SUPPLY_FOR_STAGE = type(uint256).max;

    function initialize(
        string memory _name, 
        string memory _symbol, 
        address _platformFeesAddress, 
        uint96 _platformFeesNumerator,
        address _administrator
    ) external initializer {
        __ERC1155_init("");
        __Administrated_init(_administrator);
        __Payout_init(_platformFeesAddress, _platformFeesNumerator);
        __Ownable_init();
        __ERC2981_init();
        __ReentrancyGuard_init_unchained();

        name = _name;
        symbol = _symbol;
    }

    function mintPublic(
        address recipient,
        uint256 tokenId,
        uint256 quantity,
        bytes memory data
    ) external payable nonReentrant {
        // Get the minter address. Default to msg.sender.
        address minter = recipient != address(0) ? recipient : msg.sender;

        // Ensure the payer is allowed if not caller
        _checkPayer(minter);

        // Load public mint stage to memory
        PublicMintStage memory mintStage = publicMintStages[tokenId];

        // Ensure that public mint stage is active
        _checkStageActive(mintStage.startTime, mintStage.endTime);

        // Ensure correct mint quantity
        _checkMintQuantity(
            tokenId,
            quantity,
            mintStage.mintLimitPerWallet,
            UNLIMITED_MAX_SUPPLY_FOR_STAGE
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, mintStage.mintPrice);

        _mintBase(minter, tokenId, quantity, data, PUBLIC_STAGE_INDEX);
    }

    function mintAllowlist(
        uint256 allowlistStageId,
        uint256 tokenId,
        address recipient,
        uint256 quantity,
        bytes32[] calldata merkleProof,
        bytes memory data
    ) external payable nonReentrant {
        // Get the minter address. Default to msg.sender.
        address minter = recipient != address(0) ? recipient : msg.sender;

        // Ensure the payer is allowed if not caller
        _checkPayer(minter);

        // Load allowlist mint stage to memory
        AllowlistMintStage memory mintStage = allowlistMintStages[tokenId][allowlistStageId];

        // Ensure that allowlist mint stage is active
        _checkStageActive(
            mintStage.startTime,
            mintStage.endTime
        );

        // Ensure correct mint quantity
        _checkMintQuantity(
            tokenId,
            quantity,
            mintStage.mintLimitPerWallet,
            mintStage.maxSupplyForStage
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, mintStage.mintPrice);

        if (
            !MerkleProof.verifyCalldata(
                merkleProof,
                mintStage.merkleRoot,
                keccak256(abi.encodePacked(minter))
            )
        ) {
            revert AllowlistStageInvalidProof();
        }

        _mintBase(minter, tokenId, quantity, data, ALLOWLIST_STAGE_INDEX);
    }

    function mintTokenGated(
        address recipient,
        uint256 tokenId,
        address nftContract,
        uint256[] calldata tokenIds,
        bytes memory data
    ) external payable nonReentrant {
        // Get the minter address. Default to msg.sender.
        address minter = recipient != address(0) ? recipient : msg.sender;

        // Ensure the payer is allowed if not caller
        _checkPayer(minter);

        // Load token gated mint stage to memory
        TokenGatedMintStage memory mintStage = tokenGatedMintStages[tokenId][
            nftContract
        ];

        // For easier access
        uint256 quantity = tokenIds.length;

        // Ensure that token holder mint stage is active
        _checkStageActive(
            mintStage.startTime,
            mintStage.endTime
        );

        // Ensure correct mint quantity
        _checkMintQuantity(
            tokenId,
            quantity,
            mintStage.mintLimitPerWallet,
            mintStage.maxSupplyForStage
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, mintStage.mintPrice);

        // For easier and cheaper access.
        mapping(uint256 => bool)
            storage redeemedTokenIds = _tokenGatedTokenRedeems[tokenId][nftContract];

        // Iterate through each tokenIds to make sure it's not already claimed
        for (uint256 i = 0; i < quantity; ) {
            // For easier and cheaper access.
            uint256 gatedTokenId = tokenIds[i];

            // Check that the minter is the owner of the tokenId.
            if (IERC721(nftContract).ownerOf(tokenId) != minter) {
                revert TokenGatedNotTokenOwner();
            }

            // Check that the token id has not already been redeemed.
            if (redeemedTokenIds[gatedTokenId]) {
                revert TokenGatedTokenAlreadyRedeemed();
            }

            // Mark the token id as redeemed.
            redeemedTokenIds[gatedTokenId] = true;

            unchecked {
                ++i;
            }
        }

        _mintBase(minter, tokenId, quantity, data, TOKEN_GATED_STAGE_INDEX);
    }

    function getPublicMintStage(
        uint256 tokenId
    ) external view returns (PublicMintStage memory) {
        return publicMintStages[tokenId];
    }

    function getAllowlistMintStage(
        uint256 tokenId,
        uint256 allowlistStageId
    ) external view returns (AllowlistMintStage memory) {
        return allowlistMintStages[tokenId][allowlistStageId];
    }

    function getTokenGatedMintStage(
        uint256 tokenId,
        address nftContract
    ) external view returns (TokenGatedMintStage memory) {
        return tokenGatedMintStages[tokenId][nftContract];
    }

    function getTokenGatedIsRedeemed(
        uint256 tokenId,
        address nftContract,
        uint256 nftContractTokenId
    ) external view returns (bool) {
        return _tokenGatedTokenRedeems[tokenId][nftContract][nftContractTokenId];
    }

    function createToken(string calldata tokenUri) external onlyOwnerOrAdministrator {
         latestTokenId = latestTokenId + 1;
        _updateTokenURI(latestTokenId, tokenUri);
    }

    function updateConfiguration(
        uint256 tokenId,
        MultiConfig calldata config
    ) external onlyOwnerOrAdministrator {
        // Update max supply
        _updateMaxSupply(tokenId, config.maxSupply);

        // Update base URI
         _updateTokenURI(tokenId, config.baseURI);

        // Update public phase
        _updatePublicMintStage(tokenId, config.publicMintStage);

        // Update allowlist phases
        for (uint256 i = 0; i < config.allowlistMintStages.length; ) {
            _updateAllowlistMintStage(tokenId, config.allowlistMintStages[i]);

            unchecked {
                ++i;
            }
        }

        // Update token gated phases
        for (uint256 i = 0; i < config.tokenGatedMintStages.length; ) {
            _updateTokenGatedMintStage(tokenId, config.tokenGatedMintStages[i]);

            unchecked {
                ++i;
            }
        }
    }

    function updatePublicMintStage(
        uint256 tokenId,
        PublicMintStage calldata publicMintStageData
    ) external onlyOwnerOrAdministrator {
        _checkValidTokenId(tokenId);
        _updatePublicMintStage(tokenId, publicMintStageData);
    }

    function updateAllowlistMintStage(
        uint256 tokenId,
        AllowlistMintStageConfig calldata allowlistMintStageConfig
    ) external onlyOwnerOrAdministrator {
        _checkValidTokenId(tokenId);
        _updateAllowlistMintStage(tokenId, allowlistMintStageConfig);
    }

    function updateTokenGatedMintStage(
        uint256 tokenId,
        TokenGatedMintStageConfig calldata tokenGatedMintStageConfig
    ) external onlyOwnerOrAdministrator {
        _checkValidTokenId(tokenId);
        _updateTokenGatedMintStage(tokenId, tokenGatedMintStageConfig);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC1155Upgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _updatePublicMintStage(
        uint256 tokenId,
        PublicMintStage calldata publicMintStageData
    ) internal {
        publicMintStages[tokenId] = publicMintStageData;

        emit PublicMintStageUpdated(tokenId, publicMintStageData);
    }

    function _updateAllowlistMintStage(
        uint256 tokenId,
        AllowlistMintStageConfig calldata allowlistMintStageConfig
    ) internal {
        allowlistMintStages[tokenId][allowlistMintStageConfig.id] = allowlistMintStageConfig.data;

        emit AllowlistMintStageUpdated(tokenId, allowlistMintStageConfig.id, allowlistMintStageConfig.data);
    }

    function _updateTokenGatedMintStage(
        uint256 tokenId,
        TokenGatedMintStageConfig calldata tokenGatedMintStageConfig
    ) internal {
        if (tokenGatedMintStageConfig.nftContract == address(0)) {
            revert TokenGatedNftContractCannotBeZeroAddress();
        }

        tokenGatedMintStages[tokenId][tokenGatedMintStageConfig.nftContract] = tokenGatedMintStageConfig.data;

        emit TokenGatedMintStageUpdated(tokenId, tokenGatedMintStageConfig.nftContract, tokenGatedMintStageConfig.data);
    }
}

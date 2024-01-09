// SPDX-License-Identifier: Unlicense

pragma solidity 0.8.23;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {PublicMintStage, AllowlistMintStage, AllowlistMintStageConfig, TokenGatedMintStage, TokenGatedMintStageConfig} from "./lib/DropStructs.sol";

import {ERC1155Metadata} from "./core/ERC1155Metadata.sol";
import {Payout} from "./core/Payout.sol";
import {IERC1155EditionsImplementation} from "./interface/IERC1155EditionsImplementation.sol";

contract ERC1155EditionsImplementation is
    OwnableUpgradeable,
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
        uint96 _platformFeesNumerator
    ) external initializer {
        __ERC1155_init("");
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
        address minter = recipient != address(0) ? recipient : msg.sender;

        _checkPayer(minter);

        PublicMintStage memory mintStage = publicMintStages[tokenId];

        
        _checkStageActive(mintStage.startTime, mintStage.endTime);

        
        _checkMintQuantity(
            tokenId,
            quantity,
            mintStage.mintLimitPerWallet,
            UNLIMITED_MAX_SUPPLY_FOR_STAGE
        );

        
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
        
        address minter = recipient != address(0) ? recipient : msg.sender;

        
        _checkPayer(minter);

        
        AllowlistMintStage memory mintStage = allowlistMintStages[tokenId][allowlistStageId];

        
        _checkStageActive(
            mintStage.startTime,
            mintStage.endTime
        );

        
        _checkMintQuantity(
            tokenId,
            quantity,
            mintStage.mintLimitPerWallet,
            mintStage.maxSupplyForStage
        );

        
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
        
        address minter = recipient != address(0) ? recipient : msg.sender;

        
        _checkPayer(minter);

        
        TokenGatedMintStage memory mintStage = tokenGatedMintStages[tokenId][
            nftContract
        ];

        
        uint256 quantity = tokenIds.length;

        
        _checkStageActive(
            mintStage.startTime,
            mintStage.endTime
        );

        
        _checkMintQuantity(
            tokenId,
            quantity,
            mintStage.mintLimitPerWallet,
            mintStage.maxSupplyForStage
        );

        
        _checkFunds(msg.value, quantity, mintStage.mintPrice);

        
        mapping(uint256 => bool)
            storage redeemedTokenIds = _tokenGatedTokenRedeems[tokenId][nftContract];

        
        for (uint256 i = 0; i < quantity; ) {
            
            uint256 gatedTokenId = tokenIds[i];

            
            if (IERC721(nftContract).ownerOf(tokenId) != minter) {
                revert TokenGatedNotTokenOwner();
            }

            
            if (redeemedTokenIds[gatedTokenId]) {
                revert TokenGatedTokenAlreadyRedeemed();
            }

            
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

    function createToken(string calldata tokenUri) external onlyOwner {
         latestTokenId = latestTokenId + 1;
        _updateTokenURI(latestTokenId, tokenUri);
    }

    function updateConfiguration(
        uint256 tokenId,
        MultiConfig calldata config
    ) external onlyOwner {
        
        _updateMaxSupply(tokenId, config.maxSupply);

        
         _updateTokenURI(tokenId, config.baseURI);

        
        _updatePublicMintStage(tokenId, config.publicMintStage);

        
        for (uint256 i = 0; i < config.allowlistMintStages.length; ) {
            _updateAllowlistMintStage(tokenId, config.allowlistMintStages[i]);

            unchecked {
                ++i;
            }
        }

        
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
    ) external onlyOwner {
        _checkValidTokenId(tokenId);
        _updatePublicMintStage(tokenId, publicMintStageData);
    }

    function updateAllowlistMintStage(
        uint256 tokenId,
        AllowlistMintStageConfig calldata allowlistMintStageConfig
    ) external onlyOwner {
        _checkValidTokenId(tokenId);
        _updateAllowlistMintStage(tokenId, allowlistMintStageConfig);
    }

    function updateTokenGatedMintStage(
        uint256 tokenId,
        TokenGatedMintStageConfig calldata tokenGatedMintStageConfig
    ) external onlyOwner {
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

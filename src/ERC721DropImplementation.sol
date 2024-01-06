// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC721AUpgradeable} from "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {PublicMintStage, AllowlistMintStage, AllowlistMintStageConfig, TokenGatedMintStage, TokenGatedMintStageConfig} from "./lib/DropStructs.sol";

import {AdministratedUpgradeable} from "./core/AdministratedUpgradeable.sol";
import {ERC721DropMetadata} from "./core/ERC721DropMetadata.sol";
import {Payout} from "./core/Payout.sol";

import {IERC721DropImplementation} from "./interface/IERC721DropImplementation.sol";

contract ERC721DropImplementation is
    AdministratedUpgradeable,
    ERC721DropMetadata,
    Payout,
    ReentrancyGuardUpgradeable,
    IERC721DropImplementation
{
    PublicMintStage public publicMintStage;
    mapping(uint256 allowlistStageId => AllowlistMintStage allowlistMintStage) public allowlistMintStages;
    mapping(address nftContract => TokenGatedMintStage mintStage)
        public tokenGatedMintStages;
    mapping(address nftContract => mapping(uint256 tokenId => bool redeemed))
        private _tokenGatedTokenRedeems;

    mapping(address minter => mapping(address nftContract => mapping(uint256 tokenId => bool redeemed)))
        private _tokenHolderRedeemed;

    uint256 internal constant PUBLIC_STAGE_INDEX = 0;
    uint256 internal constant ALLOWLIST_STAGE_INDEX = 1;
    uint256 internal constant TOKEN_GATED_STAGE_INDEX = 2;

    uint256 internal constant UNLIMITED_MAX_SUPPLY_FOR_STAGE = type(uint256).max;

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _platformFeesAddress, 
        uint96 _platformFeesNumerator,
        address _administrator
    ) external initializerERC721A initializer {
        __ERC721A_init(_name, _symbol);
        __Administrated_init(_administrator);
        __ERC721DropMetadata_init(_baseURI);
        __Payout_init(_platformFeesAddress, _platformFeesNumerator);
        __Ownable_init();
        __ERC2981_init();
        __ReentrancyGuard_init_unchained();
    }

    function mintPublic(
        address recipient, 
        uint256 quantity
    ) external payable nonReentrant {
        address minter = recipient != address(0) ? recipient : msg.sender;

        _checkPayer(minter);
        
        _checkStageActive(publicMintStage.startTime, publicMintStage.endTime);

        _checkMintQuantity(
            minter,
            quantity,
            publicMintStage.mintLimitPerWallet,
            UNLIMITED_MAX_SUPPLY_FOR_STAGE
        );

        _checkFunds(msg.value, quantity, publicMintStage.mintPrice);

        _mintBase(minter, quantity, PUBLIC_STAGE_INDEX);
    }

    function mintAllowlist(
        uint256 allowlistStageId,
        address recipient,
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant {
        address minter = recipient != address(0) ? recipient : msg.sender;

        _checkPayer(minter);

        AllowlistMintStage memory allowlistMintStage = allowlistMintStages[allowlistStageId];

        _checkStageActive(
            allowlistMintStage.startTime,
            allowlistMintStage.endTime
        );

        _checkMintQuantity(
            minter,
            quantity,
            allowlistMintStage.mintLimitPerWallet,
            allowlistMintStage.maxSupplyForStage
        );

        _checkFunds(msg.value, quantity, allowlistMintStage.mintPrice);

        if (
            !MerkleProof.verifyCalldata(
                merkleProof,
                allowlistMintStage.merkleRoot,
                keccak256(abi.encodePacked(minter))
            )
        ) {
            revert AllowlistStageInvalidProof();
        }

        _mintBase(minter, quantity, ALLOWLIST_STAGE_INDEX);
    }

    function mintTokenGated(
        address recipient,
        address nftContract,
        uint256[] calldata tokenIds
    ) external payable nonReentrant {
        address minter = recipient != address(0) ? recipient : msg.sender;

        _checkPayer(minter);

        TokenGatedMintStage memory tokenGatedMintStage = tokenGatedMintStages[
            nftContract
        ];

        
        uint256 quantity = tokenIds.length;

        _checkStageActive(
            tokenGatedMintStage.startTime,
            tokenGatedMintStage.endTime
        );

        _checkMintQuantity(
            minter,
            quantity,
            tokenGatedMintStage.mintLimitPerWallet,
            tokenGatedMintStage.maxSupplyForStage
        );

        _checkFunds(msg.value, quantity, tokenGatedMintStage.mintPrice);

        mapping(uint256 => bool)
            storage redeemedTokenIds = _tokenGatedTokenRedeems[nftContract];

        for (uint256 i = 0; i < quantity; ) {
            /// @dev For easier and cheaper access.
            uint256 tokenId = tokenIds[i];

            if (IERC721(nftContract).ownerOf(tokenId) != minter) {
                revert TokenGatedNotTokenOwner();
            }

            if (redeemedTokenIds[tokenId]) {
                revert TokenGatedTokenAlreadyRedeemed();
            }

            redeemedTokenIds[tokenId] = true;

            unchecked {
                ++i;
            }
        }

        _mintBase(minter, quantity, TOKEN_GATED_STAGE_INDEX);
    }

    function getTokenGatedIsRedeemed(
        address nftContract,
        uint256 tokenId
    ) external view returns (bool) {
        return _tokenGatedTokenRedeems[nftContract][tokenId];
    }

    function updatePublicMintStage(
        PublicMintStage calldata publicMintStageData
    ) external onlyOwnerOrAdministrator {
        _updatePublicMintStage(publicMintStageData);
    }

    function updateAllowlistMintStage(
        AllowlistMintStageConfig calldata allowlistMintStageConfig
    ) external onlyOwnerOrAdministrator {
        _updateAllowlistMintStage(allowlistMintStageConfig);
    }

    function updateTokenGatedMintStage(
        TokenGatedMintStageConfig calldata tokenGatedMintStageConfig
    ) external onlyOwnerOrAdministrator {
        _updateTokenGatedMintStage(tokenGatedMintStageConfig);
    }

    function updateConfiguration(
        MultiConfig calldata config
    ) external onlyOwnerOrAdministrator {
       _updateMaxSupply(config.maxSupply);

        _updateBaseURI(config.baseURI);

        if (config.royaltiesReceiver != address(0)) {
            _updateRoyalties(config.royaltiesReceiver, config.royaltiesFeeNumerator);
        }

        if (config.payoutAddress != address(0)) {
            _updatePayoutAddress(config.payoutAddress);
        }

        _updatePublicMintStage(config.publicMintStage);

       for (uint256 i = 0; i < config.allowlistMintStages.length; ) {
            _updateAllowlistMintStage(config.allowlistMintStages[i]);

            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < config.tokenGatedMintStages.length; ) {
            _updateTokenGatedMintStage(config.tokenGatedMintStages[i]);

            unchecked {
                ++i;
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC2981Upgradeable, ERC721AUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            ERC721AUpgradeable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _updatePublicMintStage(
        PublicMintStage calldata publicMintStageData
    ) internal {
        publicMintStage = publicMintStageData;

        emit PublicMintStageUpdated(publicMintStageData);
    }

    function _updateAllowlistMintStage(
        AllowlistMintStageConfig calldata allowlistMintStageConfig
    ) internal {
        allowlistMintStages[allowlistMintStageConfig.id] = allowlistMintStageConfig.data;

        emit AllowlistMintStageUpdated(allowlistMintStageConfig.id, allowlistMintStageConfig.data);
    }

    function _updateTokenGatedMintStage(
        TokenGatedMintStageConfig calldata tokenGatedMintStageConfig
    ) internal {
        if (tokenGatedMintStageConfig.nftContract == address(0)) {
            revert TokenGatedNftContractCannotBeZeroAddress();
        }

        tokenGatedMintStages[tokenGatedMintStageConfig.nftContract] = tokenGatedMintStageConfig.data;

        emit TokenGatedMintStageUpdated(tokenGatedMintStageConfig.nftContract, tokenGatedMintStageConfig.data);
    }
}

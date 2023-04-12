// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

import {PublicMintStage, AllowlistMintStage, TokenGatedMintStage} from "./lib/DropStructs.sol";

import {AdministratedUpgradable} from "./core/AdministratedUpgradable.sol";
import {ERC1155ContractMetadata} from "./core/ERC1155ContractMetadata.sol";
import {Payout} from "./core/Payout.sol";
import {OperatorFilterToggle} from "./core/OperatorFilterToggle.sol";

import {IERC1155EditionsImplementation} from "./interface/IERC1155EditionsImplementation.sol";

contract ERC1155EditionsImplementation is
    AdministratedUpgradable,
    ERC1155ContractMetadata,
    Payout,
    OperatorFilterToggle,
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

    uint256 internal constant UNLIMITED_MAX_SUPPLY_FOR_STAGE =
        type(uint256).max;

    function initialize(string memory _name, string memory _symbol) external initializer {
        __ERC1155_init("");
        __Ownable_init();
        __ERC2981_init();
        __DefaultOperatorFilterer_init();

        name = _name;
        symbol = _symbol;
    }

    function mintPublic(
        address recipient, 
        uint256 tokenId, 
        uint256 quantity, 
        bytes memory data
    ) external payable {
        // Get the minter address. Default to msg.sender.
        address minter = recipient != address(0) ? recipient : msg.sender;

        // Ensure the payer is allowed if not caller
        _checkPayer(minter);

        if (tx.origin != msg.sender) {
            revert PayerNotAllowed();
        }

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

        _mintBase(minter,tokenId, quantity, data, PUBLIC_STAGE_INDEX);
    }

    function mintAllowlist(
        uint256 allowlistStageId,
        uint256 tokenId,
        address recipient,
        uint256 quantity,
        bytes32[] calldata merkleProof, 
        bytes memory data
    ) external payable {
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
    ) external payable {
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

        // Iterate through each tokenIds to make sure it's not already claimed
        for (uint256 i = 0; i < quantity; ) {
            // For easier and cheaper access.
            uint256 gatedTokenId = tokenIds[i];

            // Check that the minter is the owner of the tokenId.
             if (IERC721(nftContract).ownerOf(tokenId) != minter) {
                revert TokenGatedNotTokenOwner();
            }

            // For easier and cheaper access.
            mapping(uint256 => bool)
                storage redeemedTokenIds = _tokenGatedTokenRedeems[tokenId][nftContract];

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

    function updateConfiguration(
        uint256 tokenId,
        MultiConfig calldata config
    ) external onlyOwnerOrAdministrator {

        // Update max supply
        if(config.maxSupply > 0) {
            _updateMaxSupply(tokenId, config.maxSupply);
        }

        // Update base URI
        if(bytes(config.baseURI).length > 0){
            _updateTokenURI(tokenId, config.baseURI);
        }

        // Update public phase
        if(_toUint256(config.publicMintStage.startTime != 0) |
                _toUint256(config.publicMintStage.endTime != 0) ==
            1
        ){
            _updatePublicMintStage(tokenId, config.publicMintStage);
        }

        // Update allowlist phases
        if(config.allowlistMintStages.length > 0){
             if(config.allowlistMintStageIds.length != config.allowlistMintStages.length){
                revert AllowlistPhaseConfigMismatch();
            }

            for (uint256 i = 0; i < config.allowlistMintStages.length; ) {
                _updateAllowlistMintStage(tokenId, config.allowlistMintStageIds[i], config.allowlistMintStages[i]);

                unchecked {
                    ++i;
                }
            }
        }

         // Update token gated phases
        if(config.tokenGatedMintStages.length > 0){
             if(config.nftContracts.length != config.tokenGatedMintStages.length){
                revert TokenGatedPhaseConfigMismatch();
            }

            for (uint256 i = 0; i < config.tokenGatedMintStages.length; ) {
                _updateTokenGatedMintStage(tokenId, config.nftContracts[i], config.tokenGatedMintStages[i]);

                unchecked {
                    ++i;
                }
            }
        }
    }

    function updatePublicMintStage(
        uint256 tokenId,
        PublicMintStage calldata publicMintStageData
    ) external onlyOwnerOrAdministrator {
        _updatePublicMintStage(tokenId, publicMintStageData);
    }

    function updateAllowlistMintStage(
        uint256 tokenId,
        uint256 allowlistStageId,
        AllowlistMintStage calldata allowlistMintStageData
    ) external onlyOwnerOrAdministrator {
        _updateAllowlistMintStage(tokenId, allowlistStageId, allowlistMintStageData);
    }

    function updateTokenGatedMintStage(
        uint256 tokenId,
        address nftContract,
        TokenGatedMintStage calldata tokenGatedMintStageData
    ) external onlyOwnerOrAdministrator {
        _updateTokenGatedMintStage(tokenId, nftContract, tokenGatedMintStageData);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override {
        super.setApprovalForAll(operator, approved);
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

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
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
        uint256 allowlistStageId,
        AllowlistMintStage calldata allowlistMintStageData
    ) internal {
        allowlistMintStages[tokenId][allowlistStageId] = allowlistMintStageData;

        emit AllowlistMintStageUpdated(tokenId, allowlistStageId, allowlistMintStageData);
    }

    function _updateTokenGatedMintStage(
        uint256 tokenId,
        address nftContract,
        TokenGatedMintStage calldata tokenGatedMintStageData
    ) internal {
        if (nftContract == address(0)) {
            revert TokenGatedNftContractCannotBeZeroAddress();
        }

        tokenGatedMintStages[tokenId][nftContract] = tokenGatedMintStageData;

        emit TokenGatedMintStageUpdated(tokenId, nftContract, tokenGatedMintStageData);
    }
}

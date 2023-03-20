// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

import {PublicMintStage, AllowlistMintStage, TokenGatedMintStage} from "./lib/DropStructs.sol";

import {AdministratedUpgradable} from "./core/AdministratedUpgradable.sol";
import {ERC1155ContractMetadata} from "./core/ERC1155ContractMetadata.sol";
import {ERC2981Upgradeable} from "./core/ERC2981Upgradeable.sol";
import {Payout} from "./core/Payout.sol";
import {OperatorFilterToggle} from "./core/OperatorFilterToggle.sol";

import {IERC1155DropImplementation} from "./interface/IERC1155DropImplementation.sol";

contract ERC1155DropImplementation is
    AdministratedUpgradable,
    ERC1155ContractMetadata,
    Payout,
    OperatorFilterToggle,
    IERC1155DropImplementation
{
    mapping(uint256 tokenId => 
        PublicMintStage publicMintStage) public publicMintStage;

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
        PublicMintStage memory mintStage = publicMintStage[tokenId];

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
            if (IERC1155(nftContract).balanceOf(minter, gatedTokenId) == 0) {
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

    function getTokenGatedIsRedeemed(
        uint256 tokenId,
        address nftContract,
        uint256 nftContractTokenId
    ) external view returns (bool) {
        return _tokenGatedTokenRedeems[tokenId][nftContract][nftContractTokenId];
    }

    function updatePublicMintStage(
        uint256 tokenId,
        PublicMintStage calldata publicMintStageData
    ) external onlyOwnerOrAdministrator {
        publicMintStage[tokenId] = publicMintStageData;

        emit PublicMintStageUpdated(tokenId, publicMintStageData);
    }

    function updateAllowlistMintStage(
        uint256 tokenId,
        uint256 allowlistStageId,
        AllowlistMintStage calldata allowlistMintStageData
    ) external onlyOwnerOrAdministrator {
        allowlistMintStages[tokenId][allowlistStageId] = allowlistMintStageData;

        emit AllowlistMintStageUpdated(tokenId, allowlistStageId, allowlistMintStageData);
    }

    function updateTokenGatedMintStage(
        uint256 tokenId,
        address nftContract,
        TokenGatedMintStage calldata tokenGatedMintStageData
    ) external onlyOwnerOrAdministrator {
        if (nftContract == address(0)) {
            revert TokenGatedNftContractCannotBeZeroAddress();
        }

        tokenGatedMintStages[tokenId][nftContract] = tokenGatedMintStageData;

        emit TokenGatedMintStageUpdated(tokenId, nftContract, tokenGatedMintStageData);
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
}

// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import {PublicMintStage, AllowlistMintStage, TokenGatedMintStage} from "./lib/DropStructs.sol";

import {AdministratedUpgradable} from "./mixins/AdministratedUpgradable.sol";
import {ERC1155ContractMetadata} from "./mixins/ERC1155ContractMetadata.sol";
import {PrimarySale} from "./mixins/PrimarySale.sol";
import {OperatorFilterToggle} from "./mixins/OperatorFilterToggle.sol";

import {IERC1155DropImplementation} from "./interface/IERC1155DropImplementation.sol";

contract ERC1155DropImplementation is
    AdministratedUpgradable,
    ERC1155ContractMetadata,
    PrimarySale,
    OperatorFilterToggle,
    IERC1155DropImplementation
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

        // Ensure that public mint stage is active
        _checkStageActive(publicMintStage.startTime, publicMintStage.endTime);

        // Ensure correct mint quantity
        _checkMintQuantity(
            tokenId,
            quantity,
            publicMintStage.mintLimitPerWallet,
            UNLIMITED_MAX_SUPPLY_FOR_STAGE
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, publicMintStage.mintPrice);

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

        AllowlistMintStage storage allowlistMintStage = allowlistMintStages[allowlistStageId];

        // Ensure that allowlist mint stage is active
        _checkStageActive(
            allowlistMintStage.startTime,
            allowlistMintStage.endTime
        );

        // Ensure correct mint quantity
        _checkMintQuantity(
            tokenId,
            quantity,
            allowlistMintStage.mintLimitPerWallet,
            allowlistMintStage.maxSupplyForStage
        );

        // Ensure enough ETH is provided
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

        // Get token gated mint stage for NFT contract
        TokenGatedMintStage memory tokenGatedMintStage = tokenGatedMintStages[
            nftContract
        ];

        // For easier access
        uint256 quantity = tokenIds.length;

        // Ensure that token holder mint stage is active
        _checkStageActive(
            tokenGatedMintStage.startTime,
            tokenGatedMintStage.endTime
        );

        // Ensure correct mint quantity
        _checkMintQuantity(
            tokenId,
            quantity,
            tokenGatedMintStage.mintLimitPerWallet,
            tokenGatedMintStage.maxSupplyForStage
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, tokenGatedMintStage.mintPrice);

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
                storage redeemedTokenIds = _tokenGatedTokenRedeems[nftContract];

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
        address nftContract,
        uint256 tokenId
    ) external view returns (bool) {
        return _tokenGatedTokenRedeems[nftContract][tokenId];
    }

    function updatePublicMintStage(
        PublicMintStage calldata publicMintStageData
    ) external onlyOwnerOrAdministrator {
        publicMintStage = publicMintStageData;

        emit PublicMintStageUpdated(publicMintStageData);
    }

    function updateAllowlistMintStage(
        uint256 allowlistStageId,
        AllowlistMintStage calldata allowlistMintStageData
    ) external onlyOwnerOrAdministrator {
        allowlistMintStages[allowlistStageId] = allowlistMintStageData;

        emit AllowlistMintStageUpdated(allowlistStageId, allowlistMintStageData);
    }

    function updateTokenGatedMintStage(
        address nftContract,
        TokenGatedMintStage calldata tokenGatedMintStageData
    ) external onlyOwnerOrAdministrator {
        if (nftContract == address(0)) {
            revert TokenGatedNftContractCannotBeZeroAddress();
        }

        tokenGatedMintStages[nftContract] = tokenGatedMintStageData;

        emit TokenGatedMintStageUpdated(nftContract, tokenGatedMintStageData);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override {
        super.setApprovalForAll(operator, approved);
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

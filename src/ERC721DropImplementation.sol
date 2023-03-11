// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC721AUpgradeable} from "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {PublicMintStage, AllowlistMintStage, TokenGatedMintStage} from "./lib/ERC721DropStructs.sol";

import {AdministratedUpgradable} from "./mixins/AdministratedUpgradable.sol";
import {ERC721ContractMetadata} from "./mixins/ERC721ContractMetadata.sol";
import {Airdrop} from "./mixins/Airdrop.sol";
import {PrimarySale} from "./mixins/PrimarySale.sol";
import {OperatorFilterToggle} from "./mixins/OperatorFilterToggle.sol";

import {IERC721DropImplementation} from "./interface/IERC721DropImplementation.sol";

contract ERC721DropImplementation is
    AdministratedUpgradable,
    ERC721ContractMetadata,
    Airdrop,
    PrimarySale,
    OperatorFilterToggle,
    IERC721DropImplementation
{
    PublicMintStage public publicMintStage;
    AllowlistMintStage public allowlistMintStage;
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

    function initialize(
        string memory _name,
        string memory _symbol
    ) external initializerERC721A initializer {
        __ERC721A_init(_name, _symbol);
        __Ownable_init();
        __ERC2981_init();
        __DefaultOperatorFilterer_init();
    }

    function mintPublic(address recipient, uint256 quantity) external payable {
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
            quantity,
            publicMintStage.mintLimitPerWallet,
            UNLIMITED_MAX_SUPPLY_FOR_STAGE
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, publicMintStage.mintPrice);

        _mintBase(minter, quantity, PUBLIC_STAGE_INDEX);
    }

    function mintAllowlist(
        address recipient,
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable {
        // Get the minter address. Default to msg.sender.
        address minter = recipient != address(0) ? recipient : msg.sender;

        // Ensure the payer is allowed if not caller
        _checkPayer(minter);

        // Ensure that allowlist mint stage is active
        _checkStageActive(
            allowlistMintStage.startTime,
            allowlistMintStage.endTime
        );

        // Ensure correct mint quantity
        _checkMintQuantity(
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

        _mintBase(minter, quantity, ALLOWLIST_STAGE_INDEX);
    }

    function mintTokenGated(
        address recipient,
        address nftContract,
        uint256[] calldata tokenIds
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
            quantity,
            tokenGatedMintStage.mintLimitPerWallet,
            tokenGatedMintStage.maxSupplyForStage
        );

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, tokenGatedMintStage.mintPrice);

        // Iterate through each tokenIds to make sure it's not already claimed
        for (uint256 i = 0; i < quantity; ) {
            // For easier and cheaper access.
            uint256 tokenId = tokenIds[i];

            // Check that the minter is the owner of the tokenId.
            if (IERC721(nftContract).ownerOf(tokenId) != minter) {
                revert TokenGatedNotTokenOwner();
            }

            // For easier and cheaper access.
            mapping(uint256 => bool)
                storage redeemedTokenIds = _tokenGatedTokenRedeems[nftContract];

            // Check that the token id has not already been redeemed.
            if (redeemedTokenIds[tokenId]) {
                revert TokenGatedTokenAlreadyRedeemed();
            }

            // Mark the token id as redeemed.
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
        publicMintStage = publicMintStageData;

        emit PublicMintStageUpdated(publicMintStageData);
    }

    function updateAllowlistMintStage(
        AllowlistMintStage calldata allowlistMintStageData
    ) external onlyOwnerOrAdministrator {
        allowlistMintStage = allowlistMintStageData;

        emit AllowlistMintStageUpdated(allowlistMintStageData);
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

    function approve(
        address operator,
        uint256 tokenId
    ) public payable override {
        if (operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.approve(operator, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public payable override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, tokenId, data);
    }
}

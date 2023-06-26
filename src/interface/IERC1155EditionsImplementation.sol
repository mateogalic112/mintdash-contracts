// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {PublicMintStage, AllowlistMintStage, AllowlistMintStageConfig, TokenGatedMintStage, TokenGatedMintStageConfig} from "../lib/DropStructs.sol";

interface IERC1155EditionsImplementation {
    struct MultiConfig {
        // Max supply
        uint256 maxSupply;

        // Collection base URI
        string baseURI;

        // Public stage
        PublicMintStage publicMintStage;

        // Allowlist stages
        AllowlistMintStageConfig[] allowlistMintStages;

        // Token gated stages
        TokenGatedMintStageConfig[] tokenGatedMintStages;
    }
    /**
     * @dev Revert if supplied merkle proof is not valid for allowlist mint stage.
     */
    error AllowlistStageInvalidProof();

    /**
     * @dev Revert if minter is not token owner for token gated mint stage.
     */
    error TokenGatedNotTokenOwner();

    /**
     * @dev Revert if token id is already redeemed for token gated mint stage.
     */
    error TokenGatedTokenAlreadyRedeemed();

    /**
     * @dev Revert if NFT contract is zero address when updating token gated mint stage.
     */
    error TokenGatedNftContractCannotBeZeroAddress();

    /**
     * @dev Emit an event when public mint stage configuration is updated.
     */
    event PublicMintStageUpdated(uint256 indexed tokenId, PublicMintStage data);

    /**
     * @dev Emit an event when allowlist mint stage configuration is updated.
     */
    event AllowlistMintStageUpdated(
        uint256 indexed tokenId,
        uint256 indexed allowlistStageId,
        AllowlistMintStage data
    );

    /**
     * @dev Emit an event when token gated mint stage configuration is updated for NFT contract.
     */
    event TokenGatedMintStageUpdated(
        uint256 indexed tokenId,
        address indexed nftContract,
        TokenGatedMintStage data
    );

    /**
     * @notice Mint a public stage.
     *
     * @param recipient Recipient of tokens.
     * @param quantity Number of tokens to mint.
     * @param tokenId ID of token to mint.
     * @param data Mint data.
     */
    function mintPublic(address recipient, uint256 tokenId, uint256 quantity, bytes memory data) external payable;

    /**
     * @notice Mint an allowlist stage.
     *
     * @param allowlistStageId ID of the allowlist stage.
     * @param tokenId ID of the token to mint.
     * @param recipient Recipient of tokens.
     * @param quantity Number of tokens to mint.
     * @param merkleProof Valid Merkle proof.
     * @param data Mint data.
     */
    function mintAllowlist(
        uint256 allowlistStageId,
        uint256 tokenId,
        address recipient,
        uint256 quantity,
        bytes32[] calldata merkleProof,
        bytes memory data
    ) external payable;

    /**
     * @notice Mint an token gated stage.
     *
     * @param recipient Recipient of tokens.
     * @param tokenId Id of the token to mint.
     * @param nftContract NFT collection to redeem for.
     * @param tokenIds Token Ids to redeem.
     * @param data Mint data.
     */
    function mintTokenGated(
        address recipient,
        uint256 tokenId,
        address nftContract,
        uint256[] calldata tokenIds,
        bytes calldata data
    ) external payable;

    /**
     * @notice Returns allowlist mint stage for token and ID.
     *
     * @param tokenId The token ID to check allowlist stage for.
     * @param tokenId The ID of allowlist stage.
     */
    function getAllowlistMintStage(uint256 tokenId, uint256 allowlistStageId) external returns(AllowlistMintStage memory);

    /**
     * @notice Returns token gated mint stage for token and NFT contract address.
     *
     * @param tokenId The token ID to check allowlist stage for.
     * @param nftContract The token gated nft contract.
     */
    function getTokenGatedMintStage(uint256 tokenId, address nftContract) external returns (TokenGatedMintStage memory);

    /**
     * @notice Returns if token is redeemed for NFT contract.
     *
     * @param tokenId ID of the token.
     * @param nftContract The token gated nft contract.
     * @param nftContractTokenId The token gated token ID to check.
     */
    function getTokenGatedIsRedeemed(
        uint256 tokenId,
        address nftContract,
        uint256 nftContractTokenId
    ) external view returns (bool);

    /**
     * @notice Updates configation for all phases.
     * @dev This should be user for initial contract configuration.
     *
     * @param tokenId The token ID to update configuration for.
     * @param config The new configuration for contract.
     */
    function updateConfiguration(
        uint256 tokenId,
        MultiConfig calldata config
    ) external;

    /**
     * @notice Updates configuration for public mint stage.
     *
     * @param tokenId ID of the token.
     * @param publicMintStageData The new public mint stage data to set.
     */
    function updatePublicMintStage(
        uint256 tokenId,
        PublicMintStage calldata publicMintStageData
    ) external;

    /**
     * @notice Updates configuration for allowlist mint stage.
     *
     * @param tokenId ID of the token.
     * @param allowlistMintStageConfig The new allowlist mint stage config to set.
     */
    function updateAllowlistMintStage(
        uint256 tokenId,
        AllowlistMintStageConfig calldata allowlistMintStageConfig
    ) external;

    /**
     * @notice Updates configuration for token gated mint stage.
     *
     * @param tokenId ID of the token.
     * @param tokenGatedMintStageConfig The new token gated mint stage config to set.
     */
    function updateTokenGatedMintStage(
        uint256 tokenId,
        TokenGatedMintStageConfig calldata tokenGatedMintStageConfig
    ) external;
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { PublicMintStage, AllowlistMintStage, TokenGatedMintStage } from "../lib/ERC721DropStructs.sol";

interface IERC721DropImplementation {
    /**
    * @dev Revert if called mint stage is not currently yet.
    */
    error StageNotActive(uint256 blockTimestamp, uint256 startTime, uint256 endTime);

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
    * @dev Revert if supplied ETH value is not valid for the mint.
    */
    error IncorrectFundsProvided();

    /**
    * @dev Revert if mint quantity exceeds wallet limit for the mint stage.
    */
    error MintQuantityExceedsWalletLimit();

    /**
    * @dev Revert if mint quantity exceeds max supply of the collection.
    */
    error MintQuantityExceedsMaxSupply();

    /**
    * @dev Revert if mint quantity exceeds max supply for stage.
    */
    error MintQuantityExceedsMaxSupplyForStage();

    /**
    * @dev Revert if provenance hash is being updated after tokens have been minted.
    */
    error ProvenanceHashCannotBeUpdatedAfterMintStarted();

    /**
    * @dev Revert if max supply exceeds uint64 max.
    */
    error CannotExceedMaxSupplyOfUint64();

    /**
     * @dev Revert if the contract balance is zero when withdrawing funds.
    */
    error NothingToWithdraw();

    /**
     * @dev Revert if the payout address is zero address.
    */
    error InvalidPayoutAddress();

    /**
     * @dev Revert if the payout address is zero address.
    */
    error PayerNotAllowed();

    /**
     * @dev Revert if NFT contract is zero address when updating token gated mint stage.
    */
    error TokenGatedNftContractCannotBeZeroAddress();

    /**
     * @dev Revert if payout address is zero address when updating payout address.
    */
    error PayoutAddressCannotBeZeroAddress();

    /**
     * @dev Emit an event when token is minted.
    */
    event Minted(address indexed recipient, uint256 indexed quantity, uint256 indexed stageIndex);

    /**
     * @dev Emit an event when provenance hash is updated.
    */
    event ProvenanceHashUpdated(bytes32 indexed provenanceHash);

    /**
     * @dev Emit an event when royalties are updated.
    */
    event RoyaltiesUpdated(address indexed receiver, uint96 indexed feeNumerator);

    /**
     * @dev Emit an event when base URI of the collection is updated.
    */
    event BaseURIUpdated(string indexed baseURI);

    /**
     * @dev Emit an event when max supply of the collection is updated.
     */
    event MaxSupplyUpdated(uint256 indexed maxSupply);

     /**
     * @dev Emit an event when operator filterer is enabled or disabled.
     */
    event OperatorFiltererEnabledUpdated(bool indexed enabled);

     /**
     * @dev Emit an event when public mint stage configuration is updated.
     */
    event PublicMintStageUpdated(PublicMintStage data);

    /**
     * @dev Emit an event when allowlist mint stage configuration is updated.
     */
    event AllowlistMintStageUpdated(AllowlistMintStage data);

    /**
     * @dev Emit an event when token gated mint stage configuration is updated for NFT contract.
     */
    event TokenGatedMintStageUpdated(address indexed nftContract, TokenGatedMintStage data);
    
    /**
     * @dev Emit an event for token metadata reveals/updates,
     *      according to EIP-4906.
     *
     * @param _fromTokenId The start token id.
     * @param _toTokenId   The end token id.
     */
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

    /**
     * @notice Mint a public stage.
     *
     * @param recipient Recipient of tokens.
     * @param quantity Number of tokens to mint.
     */
    function mintPublic(address recipient, uint256 quantity) external payable;

    /**
     * @notice Mint an allowlist stage.
     *
     * @param recipient Recipient of tokens.
     * @param quantity Number of tokens to mint.
     * @param merkleProof Valid Merkle proof.
     */
    function mintAllowlist(address recipient, uint256 quantity, bytes32[] calldata merkleProof) external payable;
    
     /**
     * @notice Mint an token gated stage.
     *
     * @param recipient Recipient of tokens.
     * @param nftContract NFT collection to redeem for.
     * @param tokenIds Token Ids to redeem.
     */
    function mintTokenGated(address recipient, address nftContract, uint256[] calldata tokenIds) external payable;

    /**
     * @notice Burns a token.
     *
     * @param tokenId Id of the token to burn.
     */
    function burn(uint256 tokenId) external;

    /**
     * @notice Mints tokens to addresses.
     *
     * @param to List of addresses to receive tokens.
     * @param quantity List of quantities to assign to each address.
     */
    function airdrop(address[] calldata to, uint64[] calldata quantity) external;

    /**
     * @notice Returns number of tokens minted for address.
     *
     * @param user The address of user to check minted amount for.
     */
    function getAmountMinted(address user) external view returns (uint64);

    /**
     * @notice Returns if token is redeemed for NFT contract.
     *
     * @param nftContract The token gated nft contract.
     * @param tokenId The token gated token ID to check.
     */
    function getTokenGatedIsRedeemed(address nftContract, uint256 tokenId) external view returns (bool);

     /**
     * @notice Updates configuration for public mint stage.
     *
     * @param publicMintStageData The new public mint stage data to set.
     */
    function updatePublicMintStage(PublicMintStage calldata publicMintStageData) external;

    /**
     * @notice Updates configuration for allowlist mint stage.
     *
     * @param allowlistMintStageData The new allowlist mint stage data to set.
     */
    function updateAllowlistMintStage(AllowlistMintStage calldata allowlistMintStageData) external;

    /**
     * @notice Updates configuration for token gated mint stage.
     *
     * @param nftContract Gated NFT contract address to be updated.
     * @param tokenGatedMintStageData The new token gated mint stage data to set.
     */
    function updateTokenGatedMintStage(address nftContract, TokenGatedMintStage calldata tokenGatedMintStageData) external;

    /**
     * @notice Updates configuration for allowlist mint stage.
     *
     * @param newMaxSupply The new max supply to set.
     */
    function updateMaxSupply(uint256 newMaxSupply) external;

    /**
     * @notice Enabled or disables operator filter for Opensea royalties enforcement.
     *
     * @param enabled If operator filter is enabled.
     */
    function updateOperatorFilterer(bool enabled) external;

    /**
     * @notice Updates base URI of the collection.
     *
     * @param newUri The new base URI to set.
     */
    function updateBaseURI(string calldata newUri) external;

    /**
     * @notice Updates royalties for the collection.
     *
     * @param receiver New address of the royalties receiver.
     * @param feeNumerator Royalties amount %.
     */
    function updateRoyalties(address receiver, uint96 feeNumerator) external;

    /**
     * @notice Updates provenance hash.
               This function will revert after the first item has been minted.
     *
     * @param newProvenanceHash The new provenance hash to set.
     */
    function updateProvenanceHash(bytes32 newProvenanceHash) external;

    /**
     * @notice Updates allowed payers.
     *
     * @param payer Payer to be updated.
     * @param payer If payer is allowed.
     */
    function updatePayer(address payer, bool isAllowed) external;

    /**
     * @notice Withdraws all funds from the contract.
               This function will revert if contract balance is zero.
    */
    function withdrawAllFunds() external;
}
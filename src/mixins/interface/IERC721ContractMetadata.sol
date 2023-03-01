// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC721ContractMetadata {
    /**
    * @dev Revert if called mint stage is not currently yet.
    */
    error StageNotActive(uint256 blockTimestamp, uint256 startTime, uint256 endTime);

    /**
    * @dev Revert if max supply exceeds uint64 max.
    */
    error CannotExceedMaxSupplyOfUint64();

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
     * @dev Emit an event when provenance hash is updated.
    */
    event ProvenanceHashUpdated(bytes32 indexed provenanceHash);

    /**
     * @dev Emit an event for token metadata reveals/updates,
     *      according to EIP-4906.
     *
     * @param _fromTokenId The start token id.
     * @param _toTokenId   The end token id.
     */
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

    /**
     * @dev Emit an event when base URI of the collection is updated.
    */

    event BaseURIUpdated(string indexed baseURI);
    /**
    * @dev Emit an event when max supply of the collection is updated.
    */

    event MaxSupplyUpdated(uint256 indexed maxSupply);

    /**
     * @dev Emit an event when token is minted.
    */
    event Minted(address indexed recipient, uint256 indexed quantity, uint256 indexed stageIndex);

    /**
     * @dev Emit an event when royalties are updated.
    */
    event RoyaltiesUpdated(address indexed receiver, uint96 indexed feeNumerator);

    /**
     * @notice Updates royalties for the collection.
     *
     * @param receiver New address of the royalties receiver.
     * @param feeNumerator Royalties amount %.
     */
    function updateRoyalties(address receiver, uint96 feeNumerator) external;

     /**
     * @notice Returns number of tokens minted for address.
     *
     * @param user The address of user to check minted amount for.
     */
    function getAmountMinted(address user) external view returns (uint64);

    /**
     * @notice Burns a token.
     *
     * @param tokenId Id of the token to burn.
     */
    function burn(uint256 tokenId) external;

     /**
     * @notice Updates configuration for allowlist mint stage.
     *
     * @param newMaxSupply The new max supply to set.
     */
    function updateMaxSupply(uint256 newMaxSupply) external;

    /**
     * @notice Updates provenance hash.
               This function will revert after the first item has been minted.
     *
     * @param newProvenanceHash The new provenance hash to set.
     */
    function updateProvenanceHash(bytes32 newProvenanceHash) external;

    /**
     * @notice Updates base URI of the collection.
     *
     * @param newUri The new base URI to set.
     */
    function updateBaseURI(string calldata newUri) external;
}
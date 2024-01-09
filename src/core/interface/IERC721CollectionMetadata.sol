// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

interface IERC721CollectionMetadata {
    /**
     * @notice Emitted when token is created
     * @param creator The address of the token creator
     * @param tokenId The tokenId of the newly minted NFT.
     * @param tokenCID Token CID
     */
    event Minted(
        address indexed creator,
        uint256 indexed tokenId,
        string tokenCID
    );

    /**
     * @notice Emitted when batch of NFTs is minted
     * @param startTokenId The tokenId of the first minted NFT in the batch
     * @param endTokenId The tokenId of the last minted NFT in the batch
     * @param creator The address of the token creator
     * @param tokenCIDs Token CIDs
     */
    event BatchMinted(
        uint256 indexed startTokenId,
        uint256 indexed endTokenId,
        address indexed creator,
        string[] tokenCIDs
    );

    error URIQueryForNonexistentToken();
}
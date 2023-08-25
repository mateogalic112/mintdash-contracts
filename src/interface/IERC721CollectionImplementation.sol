// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC721CollectionImplementation {

    /**
     * @dev Emit an event when royalties are updated.
    */
    event RoyaltiesUpdated(
        address indexed receiver,
        uint96 indexed feeNumerator
    );

    /**
     * @dev Emit an event when base URI of the collection is updated.
    */
    event BaseURIUpdated(string indexed baseURI);

    error CallerNotTokenOwner();
}
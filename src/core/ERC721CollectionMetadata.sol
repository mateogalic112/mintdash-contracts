// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {AdministratedUpgradeable} from "./AdministratedUpgradeable.sol";
import {IERC721CollectionMetadata} from "./interface/IERC721CollectionMetadata.sol";

abstract contract ERC721CollectionMetadata is 
    AdministratedUpgradeable,
    ERC721BurnableUpgradeable,
    IERC721CollectionMetadata
{
    //// @dev Minting starts at tokenId 1.
    uint256 public latestTokenId;

    /// @dev Tracks how many tokens have been burned.
    uint256 private burnCounter;

    /// @dev Base URI of the collection. Defaults to ipfs://
    string public baseURI;

    //// @dev Stores a CID for each NFT.
    mapping(uint256 tokenId => string tokenCID) private _tokenCIDs;

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        return string(abi.encodePacked(_baseURI(), _tokenCIDs[tokenId]));
    }

    function totalSupply() external view returns (uint256 supply) {
        unchecked {
            supply = latestTokenId - burnCounter;
        }
    }

    function _mintBase(string calldata tokenCID) internal {
        uint256 tokenId = ++latestTokenId;

        _mint(owner(), tokenId);

        _tokenCIDs[tokenId] = tokenCID;

        emit Minted(owner(), tokenId, tokenCID);
    }

    function _batchMintBase(string[] calldata tokenCIDs) internal {
        uint256 currentTokenId = latestTokenId;
        uint256 startTokenId = currentTokenId + 1;

        for (uint256 i = 0; i < tokenCIDs.length; ) {
            _mint(owner(), ++currentTokenId);

            _tokenCIDs[currentTokenId] = tokenCIDs[i];

            unchecked {
                ++i;
            }
        }

        latestTokenId = currentTokenId;

        emit BatchMinted(startTokenId, currentTokenId, owner(), tokenCIDs);
    }

    function _burn(uint256 tokenId) internal virtual override {
        unchecked {
            ++burnCounter;
        }
        delete _tokenCIDs[tokenId];
        super._burn(tokenId);
    }

    function _baseURI() internal view override returns (string memory uri) {
        uri = baseURI;
        if (bytes(uri).length == 0) {
            uri = "ipfs://";
        }
    }
}
// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721CollectionMetadata} from "./core/ERC721CollectionMetadata.sol";
import {IERC721CollectionImplementation} from "./interface/IERC721CollectionImplementation.sol";

contract ERC721CollectionImplementation is
    OwnableUpgradeable,
    ERC721CollectionMetadata,
    ERC2981Upgradeable,
    IERC721CollectionImplementation
{
    function initialize(
        string memory name,
        string memory symbol
    ) external initializer {
        __ERC721_init_unchained(name, symbol);
        __ERC2981_init();
        __Ownable_init();
    }

    function mint(
        string calldata tokenCID
    ) external onlyOwner {
        _mintBase(tokenCID);
    }

    function batchMint(
        string[] calldata tokenCIDs
    ) external onlyOwner {
        _batchMintBase(tokenCIDs);
    }

    function updateRoyalties(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);

        emit RoyaltiesUpdated(receiver, feeNumerator);
    }

    function updateBaseURI(
        string calldata newUri
    ) external onlyOwner {
        baseURI = newUri;

        emit BaseURIUpdated(newUri);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC2981Upgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }
}
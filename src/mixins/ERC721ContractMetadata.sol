// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC721AUpgradeable} from "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

import {ERC2981Upgradeable} from "../eip/ERC2981Upgradeable.sol";

import {AdministratedUpgradable} from "./AdministratedUpgradable.sol";

import {IERC721ContractMetadata} from "./interface/IERC721ContractMetadata.sol";

abstract contract ERC721ContractMetadata is
    ERC2981Upgradeable,
    AdministratedUpgradable,
    ERC721AUpgradeable,
    IERC721ContractMetadata
{
    uint256 public maxSupply;
    string public baseURI;
    bytes32 public provenanceHash;

    mapping(address payer => bool allowed) public allowedPayers;

    function getAmountMinted(address user) external view returns (uint64) {
        return _getAux(user);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId, true);
    }

    function updateMaxSupply(
        uint256 newMaxSupply
    ) external onlyOwnerOrAdministrator {
        // Ensure the max supply does not exceed the maximum value of uint64.
        if (newMaxSupply > 2 ** 64 - 1) {
            revert CannotExceedMaxSupplyOfUint64();
        }

        maxSupply = newMaxSupply;

        emit MaxSupplyUpdated(newMaxSupply);
    }

    function updateBaseURI(
        string calldata newUri
    ) external onlyOwnerOrAdministrator {
        baseURI = newUri;

        if (totalSupply() != 0) {
            emit BatchMetadataUpdate(1, _nextTokenId() - 1);
        }

        emit BaseURIUpdated(newUri);
    }

    function updateProvenanceHash(
        bytes32 newProvenanceHash
    ) external onlyOwnerOrAdministrator {
        // Ensure mint did not start
        if (_totalMinted() > 0) {
            revert ProvenanceHashCannotBeUpdatedAfterMintStarted();
        }

        provenanceHash = newProvenanceHash;

        emit ProvenanceHashUpdated(newProvenanceHash);
    }

    function updateRoyalties(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwnerOrAdministrator {
        _setDefaultRoyalty(receiver, feeNumerator);

        emit RoyaltiesUpdated(receiver, feeNumerator);
    }

    function updatePayer(
        address payer,
        bool isAllowed
    ) external onlyOwnerOrAdministrator {
        allowedPayers[payer] = isAllowed;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721AUpgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _checkPayer(address minter) internal view {
        if (minter != msg.sender) {
            if (!allowedPayers[msg.sender]) {
                revert PayerNotAllowed();
            }
        }
    }

    function _checkFunds(
        uint256 funds,
        uint256 quantity,
        uint256 tokenPrice
    ) internal pure {
        // Ensure enough ETH is sent
        if (funds < tokenPrice * quantity) {
            revert IncorrectFundsProvided();
        }
    }

    function _checkMintQuantity(
        uint256 quantity,
        uint256 walletLimit,
        uint256 maxSupplyForStage
    ) internal view {
        // Ensure max supply is not exceeded
        if (_totalMinted() + quantity > maxSupply) {
            revert MintQuantityExceedsMaxSupply();
        }

        // Ensure wallet limit is not exceeded
        uint256 balanceAfterMint = _getAux(msg.sender) + quantity;
        if (balanceAfterMint > walletLimit) {
            revert MintQuantityExceedsWalletLimit();
        }

        // Ensure max supply for stage is not exceeded
        if (quantity + totalSupply() > maxSupplyForStage) {
            revert MintQuantityExceedsMaxSupplyForStage();
        }
    }

    function _checkStageActive(
        uint256 startTime,
        uint256 endTime
    ) internal view {
        if (
            _toUint256(block.timestamp < startTime) |
                _toUint256(block.timestamp > endTime) ==
            1
        ) {
            revert StageNotActive(block.timestamp, startTime, endTime);
        }
    }

    function _mintBase(
        address recipient,
        uint256 quantity,
        uint256 mintStageIndex
    ) internal {
        uint256 balanceAfterMint = _getAux(recipient) + quantity;

        _setAux(recipient, uint64(balanceAfterMint));
        _mint(recipient, quantity);

        emit Minted(recipient, quantity, mintStageIndex);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    function _toUint256(bool b) internal pure returns (uint256 u) {
        assembly {
            u := b
        }
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

import {ERC2981Upgradeable} from "../eip/ERC2981Upgradeable.sol";

import {AdministratedUpgradable} from "./AdministratedUpgradable.sol";

import {IERC1155ContractMetadata} from "./interface/IERC1155ContractMetadata.sol";

abstract contract ERC1155ContractMetadata is
    ERC2981Upgradeable,
    AdministratedUpgradable,
    ERC1155Burnable,
    IERC1155ContractMetadata
{
    string public baseURI;
    bytes32 public provenanceHash;

    mapping(uint256 tokenId=> uint256 maxSupply) public maxSupply;
    mapping(uint256 tokenId => uint256 totalSupply) public totalSupply;
    mapping(address user => mapping(uint256 tokenId => uint256 amount)) public minted;

    mapping(address payer => bool allowed) public allowedPayers;

    function getAmountMinted(address user, uint256 tokenId) external view returns (uint64) {
        return minted[user][tokenId];
    }

    function updateMaxSupply(
        uint256 tokenId,
        uint256 newMaxSupply
    ) external onlyOwnerOrAdministrator {
        // Ensure the max supply does not exceed the maximum value of uint64.
        if (newMaxSupply > 2 ** 64 - 1) {
            revert CannotExceedMaxSupplyOfUint64();
        }

        maxSupply[tokenId] = newMaxSupply;

        emit MaxSupplyUpdated(newMaxSupply);
    }

    function updateBaseURI(
        string calldata newUri
    ) external onlyOwnerOrAdministrator {
        baseURI = newUri;

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
        override(ERC1155Burnable, ERC2981Upgradeable)
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
        uint256 tokenId,
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

    function _toUint256(bool b) internal pure returns (uint256 u) {
        assembly {
            u := b
        }
    }
}

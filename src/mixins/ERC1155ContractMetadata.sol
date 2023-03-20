// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

import {ERC2981Upgradeable} from "../eip/ERC2981Upgradeable.sol";

import {AdministratedUpgradable} from "./AdministratedUpgradable.sol";

import {IERC1155ContractMetadata} from "./interface/IERC1155ContractMetadata.sol";

abstract contract ERC1155ContractMetadata is
    ERC2981Upgradeable,
    AdministratedUpgradable,
    ERC1155BurnableUpgradeable,
    IERC1155ContractMetadata
{
    string public name;
    string public symbol;

    bytes32 public provenanceHash;

    mapping(uint256 tokenId=> uint256 maxSupply) public maxSupply;
    mapping(uint256 tokenId => uint256 totalSupply) public totalSupply;
    mapping(address user => mapping(uint256 tokenId => uint64 amount)) public minted;

    mapping(address payer => bool allowed) public allowedPayers;

    function getAmountMinted(address user, uint256 tokenId) external view returns (uint64) {
        return minted[user][tokenId];
    }

    function airdrop(
        address[] calldata to,
        uint256[] calldata tokenId,
        uint64[] calldata quantity
    ) external onlyOwnerOrAdministrator {
        address[] memory recipients = to;

        for (uint64 i = 0; i < recipients.length; ) {
            _mint(recipients[i], tokenId[i], quantity[i], "");

            unchecked {
                ++i;
            }
        }

       for (uint64 i = 0; i < tokenId.length; ) {
            if (totalSupply[tokenId[i]] > maxSupply[tokenId[i]]) {
                revert MintQuantityExceedsMaxSupply();
            }

            unchecked {
                ++i;
            }
        }
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

        emit MaxSupplyUpdated(tokenId, newMaxSupply);
    }

    function updateBaseURI(
        string calldata newUri
    ) external onlyOwnerOrAdministrator {
        _setURI(newUri);

        emit BaseURIUpdated(newUri);
    }

    function updateProvenanceHash(
        bytes32 newProvenanceHash
    ) external onlyOwnerOrAdministrator {
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
        override(ERC1155Upgradeable, ERC2981Upgradeable)
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
        uint256 tokenId,
        uint256 quantity,
        uint256 walletLimit,
        uint256 maxSupplyForStage
    ) internal view {
        // Ensure max supply is not exceeded
        if (totalSupply[tokenId] + quantity > maxSupply[tokenId]) {
            revert MintQuantityExceedsMaxSupply();
        }

        // Ensure wallet limit is not exceeded
        uint256 balanceAfterMint = minted[msg.sender][tokenId] + quantity;
        if (balanceAfterMint > walletLimit) {
            revert MintQuantityExceedsWalletLimit();
        }

        // Ensure max supply for stage is not exceeded
        if (totalSupply[tokenId] + quantity > maxSupplyForStage) {
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
        bytes memory data,
        uint256 mintStageIndex
    ) internal {
        minted[recipient][tokenId] += uint64(quantity);

        _mint(recipient, tokenId, quantity, data);

        emit Minted(recipient, tokenId, quantity, mintStageIndex);
    }

    function _toUint256(bool b) internal pure returns (uint256 u) {
        assembly {
            u := b
        }
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.23;

import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {IPayout} from "./interface/IPayout.sol";

abstract contract Payout is OwnableUpgradeable, ERC2981Upgradeable, IPayout {
    address public payoutAddress;

    address public platformFeesAddress;
    uint96 public platformFeesNumerator;

    function __Payout_init(address _platformFeesAddress, uint96 _platformFeesNumerator)
        internal
        onlyInitializing
    {
        platformFeesAddress = _platformFeesAddress;
        platformFeesNumerator = _platformFeesNumerator;
    }

    function updatePayoutAddress(
        address newPayoutAddress
    ) external onlyOwner {
        _updatePayoutAddress(newPayoutAddress);
    }

    function updateRoyalties(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        _updateRoyalties(receiver, feeNumerator);
    }

    function withdrawAllFunds() external onlyOwner {
        if (address(this).balance == 0) {
            revert NothingToWithdraw();
        }

        if (payoutAddress == address(0)) {
            revert InvalidPayoutAddress();
        }

        if (platformFeesAddress == address(0)) {
            revert InvalidPlatformFeesAddress();
        }

        uint256 platformFees = (address(this).balance * platformFeesNumerator) / _feeDenominator();
        if (platformFees > 0) {
            (bool platformFeesSuccess, ) = platformFeesAddress.call{value: platformFees}("");
            if (!platformFeesSuccess) revert PlatformFeesTransferFailed();
        }

        (bool payoutSuccess, ) = payoutAddress.call{value: address(this).balance}("");
        if (!payoutSuccess) revert PayoutTransferFailed();
    }

    function _updatePayoutAddress(
        address newPayoutAddress
    ) internal {
        if (newPayoutAddress == address(0)) {
            revert PayoutAddressCannotBeZeroAddress();
        }

        payoutAddress = newPayoutAddress;

        emit PayoutAddressUpdated(newPayoutAddress);
    }

    function _updateRoyalties(
        address receiver,
        uint96 feeNumerator
    ) internal {
        _setDefaultRoyalty(receiver, feeNumerator);

        emit RoyaltiesUpdated(receiver, feeNumerator);
    }
}

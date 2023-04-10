// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {AdministratedUpgradable} from "./AdministratedUpgradable.sol";

import {IPayout} from "./interface/IPayout.sol";

abstract contract Payout is AdministratedUpgradable, ERC2981Upgradeable, IPayout {
    address public payoutAddress;

    function updatePayoutAddress(
        address newPayoutAddress
    ) external onlyOwnerOrAdministrator {
        _updatePayoutAddress(newPayoutAddress);
    }

    function updateRoyalties(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwnerOrAdministrator {
        _updateRoyalties(receiver, feeNumerator);
    }

    function withdrawAllFunds() external onlyOwnerOrAdministrator {
        if (address(this).balance == 0) {
            revert NothingToWithdraw();
        }

        if (payoutAddress == address(0)) {
            revert InvalidPayoutAddress();
        }

        (bool success, ) = payoutAddress.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
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

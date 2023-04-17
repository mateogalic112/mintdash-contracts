// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {DefaultOperatorFiltererUpgradeable} from "operator-filter-registry/src/upgradeable/DefaultOperatorFiltererUpgradeable.sol";

import {AdministratedUpgradeable} from "./AdministratedUpgradeable.sol";

import {IOperatorFilterToggle} from "./interface/IOperatorFilterToggle.sol";

abstract contract OperatorFilterToggle is
    AdministratedUpgradeable,
    DefaultOperatorFiltererUpgradeable,
    IOperatorFilterToggle
{
    bool public operatorFiltererEnabled;

    function updateOperatorFilterer(
        bool enabled
    ) external onlyOwnerOrAdministrator {
        operatorFiltererEnabled = enabled;

        emit OperatorFiltererEnabledUpdated(enabled);
    }
}

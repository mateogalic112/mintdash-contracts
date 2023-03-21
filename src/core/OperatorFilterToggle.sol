// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {DefaultOperatorFiltererUpgradeable} from "operator-filter-registry/src/upgradeable/DefaultOperatorFiltererUpgradeable.sol";

import {AdministratedUpgradable} from "./AdministratedUpgradable.sol";

import {IOperatorFilterToggle} from "./interface/IOperatorFilterToggle.sol";

abstract contract OperatorFilterToggle is
    AdministratedUpgradable,
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

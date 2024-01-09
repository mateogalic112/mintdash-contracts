// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.23;

import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {MulticallUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ERC20FixedSupplyProxyImplementation is
    ERC20BurnableUpgradeable,
    OwnableUpgradeable,
    MulticallUpgradeable
{
    function initialize(
        string calldata _name,
        string calldata _symbol,
        address recipient,
        uint256 initialSupply
    ) external initializer {
        __ERC20_init(_name, _symbol);
        __Ownable_init();

        _mint(recipient, initialSupply);
    }
}

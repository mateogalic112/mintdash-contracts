// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract AdministratedUpgradable is OwnableUpgradeable {
    address public administrator;

    event AdministrationTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    error OnlyOwnerOrAdministrator();
    error OnlyAdministrator();
    error InvalidAdministratorAddress();

    modifier onlyAdministrator() {
        if (administrator != _msgSender()) {
            revert OnlyAdministrator();
        }
        _;
    }

    modifier onlyOwnerOrAdministrator() {
        if (msg.sender != owner()) {
            if (msg.sender != administrator) {
                revert OnlyOwnerOrAdministrator();
            }
        }
        _;
    }

    function renounceAdministration() public onlyAdministrator {
        _transferAdministration(address(0));
    }

    function transferAdministration(
        address newAdmin
    ) public onlyOwner {
        if (newAdmin == address(0)) {
            revert InvalidAdministratorAddress();
        }
        _transferAdministration(newAdmin);
    }

    function _transferAdministration(address newAdmin) internal {
        address oldAdmin = administrator;
        administrator = newAdmin;
        emit AdministrationTransferred(oldAdmin, newAdmin);
    }
}
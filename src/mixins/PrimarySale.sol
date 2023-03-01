// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {AdministratedUpgradable } from "./AdministratedUpgradable.sol";

import { IPrimarySale } from "./interface/IPrimarySale.sol";

abstract contract PrimarySale is 
    AdministratedUpgradable, 
    IPrimarySale 
{
     address public payoutAddress;

    function updatePayoutAddress(address newPayoutAddress)
        external
        onlyOwnerOrAdministrator 
    {
        if(newPayoutAddress == address(0)){
            revert PayoutAddressCannotBeZeroAddress();
        }

        payoutAddress = newPayoutAddress;
    }

    function withdrawAllFunds() 
        external 
        onlyOwnerOrAdministrator 
    {
        if(address(this).balance == 0){
            revert NothingToWithdraw();
        }

        if(payoutAddress == address(0)){
            revert InvalidPayoutAddress();
        }

        payable(payoutAddress).transfer(address(this).balance);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IPrimarySale {

    /**
     * @dev Revert if payout address is zero address when updating payout address.
    */
    error PayoutAddressCannotBeZeroAddress();

    /**
     * @dev Revert if the payout address is zero address.
    */
    error InvalidPayoutAddress();

    /**
     * @dev Revert if the contract balance is zero when withdrawing funds.
    */
    error NothingToWithdraw();

    /**
     * @notice Withdraws all funds from the contract.
               This function will revert if contract balance is zero.
    */
    function withdrawAllFunds() external;

    /**
     * @notice Updates payout address
     *
     * @param newPayoutAddress New payout address.
    */
    function updatePayoutAddress(address newPayoutAddress) external;
}
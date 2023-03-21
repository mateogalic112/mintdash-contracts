// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IPayout {
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
     * @dev Emit an event when payout address is updated
     */
    event PayoutAddressUpdated(address indexed payoutAddress);

    /**
     * @dev Emit an event when royalties are updated.
     */
    event RoyaltiesUpdated(
        address indexed receiver,
        uint96 indexed feeNumerator
    );

    /**
     * @notice Updates royalties for the collection.
     *
     * @param receiver New address of the royalties receiver.
     * @param feeNumerator Royalties amount %.
     */
    function updateRoyalties(address receiver, uint96 feeNumerator) external;

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

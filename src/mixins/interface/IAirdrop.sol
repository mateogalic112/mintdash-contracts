// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IAirdrop {
    /**
     * @notice Mints tokens to addresses.
     *
     * @param to List of addresses to receive tokens.
     * @param quantity List of quantities to assign to each address.
     */
    function airdrop(
        address[] calldata to,
        uint64[] calldata quantity
    ) external;
}

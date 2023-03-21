// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IOperatorFilterToggle {
    /**
     * @dev Emit an event when operator filterer is enabled or disabled.
     */
    event OperatorFiltererEnabledUpdated(bool indexed enabled);

    /**
     * @notice Enabled or disables operator filter for Opensea royalties enforcement.
     *
     * @param enabled If operator filter is enabled.
     */
    function updateOperatorFilterer(bool enabled) external;
}

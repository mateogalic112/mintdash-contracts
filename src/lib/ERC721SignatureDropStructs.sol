// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @notice A struct for configuration of signature mint stage.
 * 
 * @param mintPrice                The mint price per token in native token (ETH, MATIC)
 * @param startTime                The start time of the stage, must not be zero.
 * @param endTIme                  The end time of the stage, must not be zero.
 * @param mintLimitPerWallet       Maximum total number of mints a user is
 *                                 allowed.
 */
struct SignatureMintStage {
    uint80 mintPrice; 
    uint48 startTime;
    uint48 endTime;
    uint16 mintLimitPerWallet;
}
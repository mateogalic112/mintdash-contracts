// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @notice A struct for configuration of public mint stage.
 * 
 * @param mintPrice                The mint price per token in native token (ETH, MATIC)
 * @param startTime                The start time of the stage, must not be zero.
 * @param endTIme                  The end time of the stage, must not be zero.
 * @param mintLimitPerWallet       Maximum total number of mints a user is
 *                                 allowed.
 */
struct PublicMintStage {
    uint80 mintPrice; 
    uint48 startTime;
    uint48 endTime;
    uint16 mintLimitPerWallet;
}

/**
 * @notice A struct for configuration of allowlist mint stage.
 * 
 * @param mintPrice                The mint price per token in native token (ETH, MATIC)
 * @param startTime                The start time of the stage, must not be zero.
 * @param endTIme                  The end time of the stage, must not be zero.
 * @param mintLimitPerWallet       Maximum total number of mints a user is
 *                                 allowed.
 * @param maxSupplyForStage        Maximum allowed supply to be minted in this stage.
 * @param merkleRoot               Merkle root of all allowed addresses.
 */
struct AllowlistMintStage {
    uint80 mintPrice; 
    uint48 startTime;
    uint48 endTime;
    uint16 mintLimitPerWallet;
    uint40 maxSupplyForStage;
    bytes32 merkleRoot;
}
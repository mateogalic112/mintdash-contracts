// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {SignedMintParams} from "../lib/DropStructs.sol";

interface IERC721SignatureMintImplementation {
    struct MultiConfig {
        // Max supply
        uint256 maxSupply;

        // Collection base URI
        string baseURI;

        // Royalties
        address royaltiesReceiver;
        uint96 royaltiesFeeNumerator;

        // Payout
        address payoutAddress;
    }

    /**
     * @dev Revert if signature is not valid.
    */
    error InvalidSignature(address recoveredAddress);

    /**
     * @dev Emit an event when allowed signer is updated.
    */
    event AllowedSignerUpdated(address indexed signer, bool indexed allowed);

    /**
     * @notice Mint a signed stage.
     *
     * @param recipient Recipient of tokens.
     * @param quantity Number of tokens to mint.
     * @param mintParams Mint parameters for this stage.
     * @param salt Salt used to create a signature.
     * @param signature Signature created by verified signers.
     */
    function mintSigned(
        address recipient,
        uint256 quantity,
        SignedMintParams calldata mintParams,
        uint256 salt,
        bytes calldata signature
    ) external payable;

    /**
     * @notice Updates configation for all phases.
     * @dev This should be user for initial contract configuration.
     *
     * @param config The new configuration for contract
     */
    function updateConfiguration(
        MultiConfig calldata config
    ) external;
}

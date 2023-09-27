// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentSplitterImplementation is Initializable {
    using SafeERC20 for IERC20;

    uint256 private constant PERCENTAGE_DENOMINATOR = 10_000;

    address[] private _recipients;
    mapping(address recipient => uint256 percentage) private _percentages;

    uint256 private _totalEthReleased;
    mapping(address recipient => uint256 amount) private _ethReleased;

    mapping(IERC20 token => uint256 amount) private _totalErc20Released;
    mapping(IERC20 token => mapping(address recipient => uint256 amount)) private _erc20Released;

    error EmptyOrMismatchedArrays();
    error InvalidPercentageAmount();
    error DuplicateRecipient();
    error NoFundsToRelease();
    error InvalidRecipient();
    error TransferFailed();

    receive() external payable {}

    function initialize(
        address[] calldata recipients,
        uint256[] calldata percentages
    ) external initializer {
        if (recipients.length == 0 || recipients.length != percentages.length) {
            revert EmptyOrMismatchedArrays();
        }

        uint256 totalPercentage;
        for (uint256 i = 0; i < percentages.length; ) {
            if (percentages[i] == 0) revert InvalidPercentageAmount();
            if (_percentages[recipients[i]] != 0) revert DuplicateRecipient();

            _recipients.push(recipients[i]);
            _percentages[recipients[i]] = percentages[i];

            totalPercentage += percentages[i];

            unchecked {
                ++i;
            }
        }

        if (totalPercentage != PERCENTAGE_DENOMINATOR) {
            revert InvalidPercentageAmount();
        }
    }

    function releaseEth(address payable recipient) external {
        if (_percentages[recipient] == 0) revert InvalidRecipient();

        uint256 amount = calculateReleasableEth(recipient);
        if (amount == 0) revert NoFundsToRelease();

        _totalEthReleased += amount;
        unchecked {
            _ethReleased[recipient] += amount;
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    function releaseErc20(IERC20 token, address recipient) external {
        if (_percentages[recipient] == 0) revert InvalidRecipient();

        uint256 amount = calculateReleasableErc20(token, recipient);
        if (amount == 0) revert NoFundsToRelease();

        _totalErc20Released[token] += amount;
        unchecked {
            _erc20Released[token][recipient] += amount;
        }

        token.safeTransfer(recipient, amount);
    }

    function calculateReleasableEth(
        address recipient
    ) public view returns (uint256) {
        uint256 totalReceived = address(this).balance + _totalEthReleased;

        uint256 amount = _calculateReleasableAmount(
            recipient,
            totalReceived,
            _ethReleased[recipient]
        );

        return amount;
    }

    function calculateReleasableErc20(
        IERC20 token,
        address recipient
    ) public view returns (uint256) {
        uint256 totalReceived = token.balanceOf(address(this)) +
            _totalErc20Released[token];

        uint256 amount = _calculateReleasableAmount(
            recipient,
            totalReceived,
            _erc20Released[token][recipient]
        );

        return amount;
    }

    function _calculateReleasableAmount(
        address recipient,
        uint256 totalReceived,
        uint256 alreadyReleased
    ) internal view returns (uint256) {
        uint256 amount = (totalReceived * _percentages[recipient]) /
            PERCENTAGE_DENOMINATOR -
            alreadyReleased;

        return amount;
    }
}

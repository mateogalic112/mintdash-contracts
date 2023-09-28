// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentSplitterImplementation is Initializable {
    using SafeERC20 for IERC20;

    uint256 public constant PERCENTAGE_DENOMINATOR = 10_000;

    address[] private _recipients;
    mapping(address recipient => uint256 percentage) public percentages;

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
        address[] calldata recipients_,
        uint256[] calldata percentages_
    ) external initializer {
        if (
            recipients_.length == 0 || recipients_.length != percentages_.length
        ) {
            revert EmptyOrMismatchedArrays();
        }

        uint256 totalPercentage;
        for (uint256 i = 0; i < percentages_.length; ) {
            if (percentages_[i] == 0) revert InvalidPercentageAmount();
            if (percentages[recipients_[i]] != 0) revert DuplicateRecipient();

            _recipients.push(recipients_[i]);
            percentages[recipients_[i]] = percentages_[i];

            totalPercentage += percentages_[i];

            unchecked {
                ++i;
            }
        }

        if (totalPercentage != PERCENTAGE_DENOMINATOR) {
            revert InvalidPercentageAmount();
        }
    }

    function releaseEth(address recipient) external {
        if (percentages[recipient] == 0) revert InvalidRecipient();

        uint256 amount = calculateReleasableEth(recipient);
        if (amount == 0) revert NoFundsToRelease();

        _releaseEth(recipient, amount);
    }

    function releaseEthToAll() external {
        address[] memory recipients = _recipients;
        for (uint256 i = 0; i < recipients.length; ++i) {
            uint256 amount = calculateReleasableEth(recipients[i]);
            if (amount == 0) continue;

            _releaseEth(recipients[i], amount);
        }
    }

    function releaseErc20(IERC20 token, address recipient) external {
        if (percentages[recipient] == 0) revert InvalidRecipient();

        uint256 amount = calculateReleasableErc20(token, recipient);
        if (amount == 0) revert NoFundsToRelease();

        _releaseErc20(token, recipient, amount);
    }

    function releaseErc20ToAll(IERC20 token) external {
        address[] memory recipients = _recipients;
        for (uint256 i = 0; i < recipients.length; ++i) {
            uint256 amount = calculateReleasableErc20(token, recipients[i]);
            if (amount == 0) continue;

            _releaseErc20(token, recipients[i], amount);
        }
    }

    function getRecipients() external view returns (address[] memory) {
        return _recipients;
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

    function _releaseEth(address recipient, uint256 amount) internal {
        _totalEthReleased += amount;
        unchecked {
            _ethReleased[recipient] += amount;
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    function _releaseErc20(
        IERC20 token,
        address recipient,
        uint256 amount
    ) internal {
        _totalErc20Released[token] += amount;
        unchecked {
            _erc20Released[token][recipient] += amount;
        }

        token.safeTransfer(recipient, amount);
    }

    function _calculateReleasableAmount(
        address recipient,
        uint256 totalReceived,
        uint256 alreadyReleased
    ) internal view returns (uint256) {
        uint256 amount = (totalReceived * percentages[recipient]) /
            PERCENTAGE_DENOMINATOR -
            alreadyReleased;

        return amount;
    }
}

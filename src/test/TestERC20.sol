// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20("Test Contract", "TEST20") {
    function mint(address to, uint256 quantity) external {
        _mint(to, quantity);
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.23;

import "erc721a/contracts/ERC721A.sol";

contract TestERC721 is ERC721A("Test Contract", "TEST721") {
    function mint(address to, uint256 quantity) external {
        _mint(to, quantity);
    }
}
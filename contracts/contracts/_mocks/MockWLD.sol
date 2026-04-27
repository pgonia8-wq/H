// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice ERC20 mock para WLD en Base Sepolia (no existe WLD oficial allí)
contract MockWLD is ERC20 {
    constructor() ERC20("Mock WLD", "WLD") {
        _mint(msg.sender, 1_000_000_000 ether);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

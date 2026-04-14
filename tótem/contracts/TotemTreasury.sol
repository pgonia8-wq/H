// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TotemTreasury {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function withdraw(address payable to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        require(address(this).balance >= amount, "Low balance");

        to.transfer(amount);
    }
}

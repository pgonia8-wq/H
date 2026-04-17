// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// FIX ALTO-1: Unified to OZ v5 import paths (utils/ instead of security/)
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TotemCredits is ReentrancyGuard, Pausable, Ownable2Step {

    mapping(address => uint256) public credits;

    event Deposited(address indexed user, uint256 amount);
    event Consumed(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "zero");

        credits[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function consume(address user, uint256 amount) external onlyOwner {
        require(credits[user] >= amount, "insufficient");

        credits[user] -= amount;

        emit Consumed(user, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(credits[msg.sender] >= amount, "insufficient");

        credits[msg.sender] -= amount;

        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "fail");
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}

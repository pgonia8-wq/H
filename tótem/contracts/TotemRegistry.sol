// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TotemRegistry {

    struct Totem {
        bool exists;
        string username;
    }

    mapping(address => Totem) public totems;

    event TotemCreated(address indexed user, string username);

    function createTotem(string calldata username) external {
        require(!totems[msg.sender].exists, "ALREADY_EXISTS");

        totems[msg.sender] = Totem(true, username);

        emit TotemCreated(msg.sender, username);
    }

    function isTotem(address user) external view returns (bool) {
        return totems[user].exists;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function getInfluence(address user) external view returns (uint256);
}

contract TotemBondingCurve {

    IOracle public oracle;

    mapping(address => uint256) public supply;

    constructor(address oracleAddress) {
        oracle = IOracle(oracleAddress);
    }

    function spotPrice(uint256 s) public pure returns (uint256) {
        return 55e9 + (235 * s * s) / 1e20;
    }

    function buy(address totem, uint256 amount) external {

        uint256 influence = oracle.getInfluence(totem);

        uint256 adjusted = (amount * influence) / 100;

        supply[totem] += adjusted;
    }

    function sell(address totem, uint256 amount) external {

        uint256 influence = oracle.getInfluence(totem);

        uint256 adjusted = (amount * influence) / 100;

        require(supply[totem] >= adjusted, "Not enough");

        supply[totem] -= adjusted;
    }
}

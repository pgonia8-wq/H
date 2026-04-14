// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function data(address)
        external view
        returns (
            uint256 score,
            uint256 influence,
            uint256 nonce,
            uint256 timestamp
        );
}

contract TotemBondingCurve {

    address public oracle;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function getInfluence(address totem)
        public view returns (uint256)
    {
        (, uint256 influence,,) = IOracle(oracle).data(totem);
        return influence == 0 ? 100 : influence;
    }

    // ⚡ CUADRÁTICA SIMPLIFICADA

    function buy(address totem, uint256 wld)
        external view returns (uint256 tokens)
    {
        uint256 inf = getInfluence(totem);

        uint256 adjusted = (wld * inf) / 100;

        tokens = sqrt(adjusted * 1000000000);
    }

    function sell(address totem, uint256 tokens)
        external view returns (uint256 wld)
    {
        uint256 inf = getInfluence(totem);

        uint256 base = (tokens * tokens) / 1000000000;

        wld = (base * 100) / inf;
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}

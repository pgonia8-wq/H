// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/// @notice Mock IWorldIDVerifier — siempre acepta la prueba (testnet only)
contract MockWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external pure {}
}

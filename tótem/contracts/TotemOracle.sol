// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TotemOracle {

    address public signer;

    constructor(address _signer) {
        signer = _signer;
    }

    struct Data {
        uint256 score;
        uint256 influence;
        uint256 nonce;
        uint256 timestamp;
    }

    mapping(address => Data) public data;
    mapping(address => uint256) public nonces;

    event Updated(address indexed totem, uint256 score, uint256 influence);

    function update(
        address totem,
        uint256 score,
        uint256 influence,
        uint256 nonce,
        bytes memory sig
    ) external {

        require(nonce == nonces[totem], "BAD_NONCE");

        bytes32 hash = keccak256(
            abi.encodePacked(totem, score, influence, nonce)
        );

        bytes32 ethHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );

        require(recover(ethHash, sig) == signer, "BAD_SIG");

        data[totem] = Data(score, influence, nonce, block.timestamp);

        nonces[totem]++;

        emit Updated(totem, score, influence);
    }

    function recover(bytes32 hash, bytes memory sig)
        internal pure returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return ecrecover(hash, v, r, s);
    }
}

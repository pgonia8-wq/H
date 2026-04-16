// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

interface IOracle {
    function getMetrics(address user) external view returns (
        uint256 score,
        uint256 influence,
        uint256 timestamp
    );
}

interface IBondingCurve {
    function getPrice(address user) external view returns (uint256);
}

contract TotemAccessGateway is ReentrancyGuard, Pausable, Ownable2Step {

    IRegistry public immutable registry;
    IOracle public immutable oracle;
    IBondingCurve public immutable curve;

    address public signer; // primary backend signer
    address public backupSigner; // EIP-712 backup signer

    mapping(address => uint256) public nonces;

    bytes32 private constant QUERY_TYPEHASH =
        keccak256("Query(address user,uint256 nonce,uint256 deadline)");

    bytes32 private DOMAIN_SEPARATOR;

    event QueryConsumed(address indexed user, uint256 score, uint256 influence);

    constructor(
        address _registry,
        address _oracle,
        address _curve,
        address _signer,
        address _backupSigner
    ) {
        registry = IRegistry(_registry);
        oracle = IOracle(_oracle);
        curve = IBondingCurve(_curve);

        signer = _signer;
        backupSigner = _backupSigner;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("TotemGateway")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // -------------------------
    // 🔐 EIP-712 VERIFY
    // -------------------------
    function _verify(
        address user,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature
    ) internal view returns (address) {

        require(block.timestamp <= deadline, "expired");

        bytes32 structHash = keccak256(
            abi.encode(
                QUERY_TYPEHASH,
                user,
                nonce,
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        return _recover(digest, signature);
    }

    function _recover(bytes32 digest, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "bad sig");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return ecrecover(digest, v, r, s);
    }

    function _isValidSigner(address recovered) internal view returns (bool) {
        return recovered == signer || recovered == backupSigner;
    }

    // -------------------------
    // 💰 MAIN FUNCTION
    // -------------------------
    function query(
        uint256 deadline,
        bytes calldata signature
    )
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256 score, uint256 influence)
    {
        address user = msg.sender;

        require(registry.isTotem(user), "not Totem");

        uint256 nonce = nonces[user]++;

        address recovered = _verify(user, nonce, deadline, signature);
        require(_isValidSigner(recovered), "invalid sig");

        uint256 price = curve.getPrice(user);
        require(msg.value >= price, "insufficient fee");

        (score, influence,) = oracle.getMetrics(user);

        emit QueryConsumed(user, score, influence);
    }

    // -------------------------
    // ADMIN
    // -------------------------
    function setSigners(address _primary, address _backup) external onlyOwner {
        signer = _primary;
        backupSigner = _backup;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

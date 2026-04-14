// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

/**
 * @title TotemOracle
 * @notice Oracle CRÍTICO para métricas del tótem (score + influence)
 * @dev FINAL PRODUCTION: EIP-712 seguro + multi-signer preparado + pausable + Registry
 */
contract TotemOracle {

    address public immutable PRIMARY_SIGNER;
    IRegistry public immutable registry;

    uint256 public constant MIN_INTERVAL = 1 hours;
    uint256 public constant MAX_SCORE = 10_000;
    uint256 public constant MIN_INFLUENCE = 80;
    uint256 public constant MAX_INFLUENCE = 120;

    bool public paused;

    // EIP-712
    bytes32 public immutable DOMAIN_SEPARATOR;

    bytes32 public constant UPDATE_TYPEHASH = keccak256(
        "UpdateMetrics(address totem,uint256 score,uint256 influence,uint256 nonce,uint256 deadline)"
    );

    struct Metrics {
        uint256 score;
        uint256 influence;
        uint256 timestamp;
    }

    mapping(address => Metrics) public metrics;
    mapping(address => uint256) public nonces;
    mapping(address => uint256) public lastUpdateTime;

    mapping(address => bool) public authorizedSigners;

    // ========================= EVENTS =========================
    event MetricsUpdated(
        address indexed totem,
        uint256 score,
        uint256 influence,
        uint256 timestamp,
        uint256 nonceUsed
    );

    event Paused(bool status);
    event SignerAuthorized(address indexed signer, bool allowed);

    // ========================= ERRORS =========================
    error NotATotem();
    error InvalidRange();
    error RateLimitExceeded();
    error InvalidNonce();
    error InvalidSignature();
    error ExpiredDeadline();
    error PausedError();
    error ZeroAddress();
    error NotAuthorizedSigner();

    // ========================= MODIFIERS =========================
    modifier whenNotPaused() {
        if (paused) revert PausedError();
        _;
    }

    constructor(address _primarySigner, address _registry) {
        if (_primarySigner == address(0) || _registry == address(0)) revert ZeroAddress();

        PRIMARY_SIGNER = _primarySigner;
        registry = IRegistry(_registry);

        authorizedSigners[_primarySigner] = true;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("TotemOracle"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );

        paused = false;
    }

    function update(
        address totem,
        uint256 score,
        uint256 influence,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused {
        if (!registry.isTotem(totem)) revert NotATotem();
        if (score == 0 || score > MAX_SCORE || influence < MIN_INFLUENCE || influence > MAX_INFLUENCE) {
            revert InvalidRange();
        }
        if (block.timestamp > deadline) revert ExpiredDeadline();
        if (block.timestamp < lastUpdateTime[totem] + MIN_INTERVAL) {
            revert RateLimitExceeded();
        }
        if (nonce != nonces[totem]) revert InvalidNonce();

        bytes32 structHash = keccak256(
            abi.encode(
                UPDATE_TYPEHASH,
                totem,
                score,
                influence,
                nonce,
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address recovered = _recover(digest, signature);
        if (!authorizedSigners[recovered]) revert NotAuthorizedSigner();

        // Actualización atómica
        nonces[totem] = nonce + 1;
        lastUpdateTime[totem] = block.timestamp;

        metrics[totem] = Metrics({
            score: score,
            influence: influence,
            timestamp: block.timestamp
        });

        emit MetricsUpdated(totem, score, influence, block.timestamp, nonce);
    }

    function _recover(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        if (sig.length != 65) revert InvalidSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }

        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            revert InvalidSignature();
        }
        if (v != 27 && v != 28) revert InvalidSignature();

        return ecrecover(digest, v, r, s);
    }

    // ========================= ADMIN =========================
    function setPaused(bool _paused) external {
        if (msg.sender != PRIMARY_SIGNER) revert NotAuthorizedSigner();
        paused = _paused;
        emit Paused(_paused);
    }

    function authorizeSigner(address signer, bool allowed) external {
        if (msg.sender != PRIMARY_SIGNER) revert NotAuthorizedSigner();
        if (signer == address(0)) revert ZeroAddress();

        authorizedSigners[signer] = allowed;
        emit SignerAuthorized(signer, allowed);
    }

    // ========================= VIEWS =========================
    function getMetrics(address totem) external view returns (
        uint256 score,
        uint256 influence,
        uint256 timestamp
    ) {
        Metrics memory m = metrics[totem];
        return (m.score, m.influence, m.timestamp);
    }

    function getNonce(address totem) external view returns (uint256) {
        return nonces[totem];
    }
}

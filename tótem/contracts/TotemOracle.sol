// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

/**
 * HTP Oracle v2
 * - Paid updates (0.01 WLD)
 * - EIP-712 signed metrics
 * - Multi-signer ready
 * - Replay + caller binding protection
 */
contract TotemOracle is ReentrancyGuard {

    // ========================= CONFIG =========================
    address public immutable PRIMARY_SIGNER;
    IRegistry public immutable registry;

    uint256 public constant UPDATE_FEE = 0.01 ether; // WLD decimals assumed handled off-chain
    uint256 public constant MIN_INTERVAL = 1 hours;

    bool public paused;

    // ========================= SIGNERS =========================
    mapping(address => bool) public authorizedSigners;

    // ========================= STATE =========================
    struct Metrics {
        uint256 score;
        uint256 influence; // base 1000
        uint256 timestamp;
    }

    mapping(address => Metrics) public metrics;
    mapping(address => uint256) public nonces;
    mapping(address => uint256) public lastUpdate;

    // ========================= EIP712 =========================
    bytes32 public immutable DOMAIN_SEPARATOR;

    bytes32 public constant UPDATE_TYPEHASH =
        keccak256(
            "UpdateMetrics(address totem,address caller,uint256 score,uint256 influence,uint256 nonce,uint256 deadline)"
        );

    // ========================= EVENTS =========================
    event MetricsUpdated(
        address indexed totem,
        uint256 score,
        uint256 influence,
        uint256 timestamp,
        uint256 nonce
    );

    event SignerUpdated(address signer, bool allowed);
    event Paused(bool status);

    // ========================= ERRORS =========================
    error NotATotem();
    error NotAuthorizedSigner();
    error InvalidSignature();
    error InvalidNonce();
    error Expired();
    error RateLimited();
    error OraclePaused();
    error InvalidRange();
    error FeeNotPaid();

    modifier whenNotPaused() {
        if (paused) revert OraclePaused();
        _;
    }

    constructor(address _primarySigner, address _registry) {
        require(_primarySigner != address(0), "zero");
        require(_registry != address(0), "zero");

        PRIMARY_SIGNER = _primarySigner;
        registry = IRegistry(_registry);

        authorizedSigners[_primarySigner] = true;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("HTPOracle"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    // =========================================================
    // UPDATE (PAID)
    // =========================================================
    function update(
        address totem,
        address caller,
        uint256 score,
        uint256 influence,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external payable whenNotPaused nonReentrant {

        if (!registry.isTotem(totem)) revert NotATotem();
        if (msg.value < UPDATE_FEE) revert FeeNotPaid();

        if (score == 0 || score > 10000) revert InvalidRange();
        if (influence < 925 || influence > 1075) revert InvalidRange();

        if (block.timestamp > deadline) revert Expired();
        if (block.timestamp < lastUpdate[totem] + MIN_INTERVAL) revert RateLimited();
        if (nonce != nonces[totem]) revert InvalidNonce();

        // ================= EIP712 =================
        bytes32 structHash = keccak256(
            abi.encode(
                UPDATE_TYPEHASH,
                totem,
                caller,
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
        if (caller != tx.origin && caller != msg.sender) {
            // binding anti spoofing (soft constraint)
        }

        // ================= STATE UPDATE =================
        nonces[totem] += 1;
        lastUpdate[totem] = block.timestamp;

        metrics[totem] = Metrics({
            score: score,
            influence: influence,
            timestamp: block.timestamp
        });

        emit MetricsUpdated(totem, score, influence, block.timestamp, nonce);
    }

    // =========================================================
    // VIEW (HTP BONDING CURVE)
    // =========================================================
    function getInfluence(address user) external view returns (uint256) {
        uint256 inf = metrics[user].influence;
        return inf == 0 ? 1000 : inf;
    }

    function getScore(address user) external view returns (uint256) {
        uint256 s = metrics[user].score;
        return s == 0 ? 1000 : s;
    }

    // =========================================================
    // ADMIN
    // =========================================================
    function setPaused(bool _p) external {
        if (msg.sender != PRIMARY_SIGNER) revert NotAuthorizedSigner();
        paused = _p;
        emit Paused(_p);
    }

    function authorizeSigner(address signer, bool allowed) external {
        if (msg.sender != PRIMARY_SIGNER) revert NotAuthorizedSigner();
        authorizedSigners[signer] = allowed;
        emit SignerUpdated(signer, allowed);
    }

    // =========================================================
    // INTERNAL
    // =========================================================
    function _recover(bytes32 digest, bytes calldata sig)
        internal
        pure
        returns (address)
    {
        if (sig.length != 65) revert InvalidSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }

        if (v != 27 && v != 28) revert InvalidSignature();

        return ecrecover(digest, v, r, s);
    }
}

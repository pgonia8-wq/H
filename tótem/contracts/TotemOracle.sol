// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

contract TotemOracle is ReentrancyGuard, Ownable2Step {

    using ECDSA for bytes32;

    // ========================= CONFIG =========================

    address public immutable PRIMARY_SIGNER;
    IRegistry public immutable registry;

    uint256 public constant UPDATE_FEE = 0.01 ether;
    uint256 public constant MIN_INTERVAL = 1 hours;

    // 🔥 ALINEADO CON CURVE
    uint256 public constant SCORE_MIN = 975;
    uint256 public constant SCORE_MAX = 1025;

    bool public paused;

    // ========================= SIGNERS =========================

    mapping(address => bool) public authorizedSigners;

    // ========================= STATE =========================

    struct Metrics {
        uint256 score;
        uint256 influence;
        uint256 timestamp;
    }

    mapping(address => Metrics) public metrics;
    mapping(address => uint256) public nonces;

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

    event SignerUpdated(address indexed signer, bool allowed);
    event Paused(address indexed by, bool status);
    event FeeWithdrawn(address indexed to, uint256 amount);

    // ========================= ERRORS =========================

    error NotATotem();
    error NotAuthorizedSigner();
    error InvalidSignature();
    error InvalidNonce();
    error Expired();
    error OraclePaused();
    error InvalidRange();
    error FeeNotPaid();
    error ZeroAddress();
    error CallerMismatch();
    error TooFrequent();

    modifier whenNotPaused() {
        if (paused) revert OraclePaused();
        _;
    }

    constructor(address _primarySigner, address _registry) Ownable(msg.sender) {
        if (_primarySigner == address(0) || _registry == address(0)) revert ZeroAddress();

        PRIMARY_SIGNER = _primarySigner;
        registry = IRegistry(_registry);

        authorizedSigners[_primarySigner] = true;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("HTPOracle")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // ========================= UPDATE =========================

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

        // 🔥 RANGO CONSISTENTE
        if (score < SCORE_MIN || score > SCORE_MAX) revert InvalidRange();
        if (influence < SCORE_MIN || influence > SCORE_MAX) revert InvalidRange();

        if (block.timestamp > deadline) revert Expired();
        if (nonce != nonces[totem]) revert InvalidNonce();
        if (caller != msg.sender) revert CallerMismatch();

        // 🔥 ANTI-SPAM / ANTI-MANIPULACIÓN
        if (block.timestamp < metrics[totem].timestamp + MIN_INTERVAL) {
            revert TooFrequent();
        }

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

        // ✅ OZ ECDSA (seguro contra malleability)
        address recovered = digest.recover(signature);

        if (!authorizedSigners[recovered]) revert NotAuthorizedSigner();

        nonces[totem] = nonce + 1;

        metrics[totem] = Metrics({
            score: score,
            influence: influence,
            timestamp: block.timestamp
        });

        emit MetricsUpdated(totem, score, influence, block.timestamp, nonce);
    }

    // ========================= VIEWS =========================

    function getInfluence(address user) external view returns (uint256) {
        uint256 inf = metrics[user].influence;
        return inf == 0 ? 1000 : inf; // neutral
    }

    function getScore(address user) external view returns (uint256) {
        uint256 s = metrics[user].score;
        return s == 0 ? 1000 : s; // 🔥 BASE NEUTRA REAL
    }

    function getMetrics(address user) external view returns (
        uint256 score,
        uint256 influence,
        uint256 timestamp
    ) {
        Metrics memory m = metrics[user];
        score     = m.score     == 0 ? 1000 : m.score;
        influence = m.influence == 0 ? 1000 : m.influence;
        timestamp = m.timestamp;
    }

    // ========================= ADMIN =========================

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(msg.sender, _paused);
    }

    function authorizeSigner(address signer, bool allowed) external onlyOwner {
        if (signer == address(0)) revert ZeroAddress();
        authorizedSigners[signer] = allowed;
        emit SignerUpdated(signer, allowed);
    }

    function withdrawFees(address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();

        uint256 amount = address(this).balance;

        // ✅ SAFE TRANSFER (multisig compatible)
        (bool success, ) = to.call{value: amount}("");
        require(success, "transfer failed");

        emit FeeWithdrawn(to, amount);
    }

    receive() external payable {}
}

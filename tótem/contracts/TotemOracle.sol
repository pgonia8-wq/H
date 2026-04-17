// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

/**
 * @title TotemOracle
 * @notice Oracle oficial del protocolo HTP - Alimenta score e influence
 * @dev Versión 2.2 - Correcciones críticas de auditoría: default mínimo, caller estricto, rate limit movido a consumidor
 */
contract TotemOracle is ReentrancyGuard {

    // ========================= CONFIG =========================
    address public immutable PRIMARY_SIGNER;
    IRegistry public immutable registry;

    uint256 public constant UPDATE_FEE = 0.01 ether;        // WLD
    uint256 public constant MIN_INTERVAL = 1 hours;         // mantenido pero soft (solo recomendación)

    bool public paused;

    // ========================= SIGNERS =========================
    mapping(address => bool) public authorizedSigners;

    // ========================= STATE =========================
    struct Metrics {
        uint256 score;      // 0 = no inicializado
        uint256 influence;  // 0 = no inicializado
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
    event Paused(bool status);
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
    error CallerMismatch();           // nuevo: caller estricto

    modifier whenNotPaused() {
        if (paused) revert OraclePaused();
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
                keccak256("HTPOracle"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    // ========================= UPDATE (CORREGIDO) =========================
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

        // Validaciones estrictas
        if (score == 0 || score > 10000) revert InvalidRange();
        if (influence < 925 || influence > 1075) revert InvalidRange();
        if (block.timestamp > deadline) revert Expired();
        if (nonce != nonces[totem]) revert InvalidNonce();

        // CORRECCIÓN CRÍTICA: Caller estricto - solo el caller firmado puede actualizar
        if (caller != msg.sender) revert CallerMismatch();

        // EIP-712
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

        // Update state
        nonces[totem] = nonce + 1;

        metrics[totem] = Metrics({
            score: score,
            influence: influence,
            timestamp: block.timestamp
        });

        emit MetricsUpdated(totem, score, influence, block.timestamp, nonce);
    }

    // ========================= VIEWS (CORREGIDAS) =========================
    function getInfluence(address user) external view returns (uint256) {
        uint256 inf = metrics[user].influence;
        return inf == 0 ? 925 : inf;        // mínimo posible hasta primera actualización real
    }

    function getScore(address user) external view returns (uint256) {
        uint256 s = metrics[user].score;
        return s == 0 ? 1 : s;              // reputación se gana, no se regala
    }

    function getMetrics(address user) external view returns (
        uint256 score,
        uint256 influence,
        uint256 timestamp
    ) {
        Metrics memory m = metrics[user];
        score     = m.score     == 0 ? 1    : m.score;
        influence = m.influence == 0 ? 925  : m.influence;
        timestamp = m.timestamp;
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
        emit SignerUpdated(signer, allowed);
    }

    function withdrawFees(address to) external {
        if (msg.sender != PRIMARY_SIGNER) revert NotAuthorizedSigner();
        if (to == address(0)) revert ZeroAddress();

        uint256 amount = address(this).balance;
        payable(to).transfer(amount);

        emit FeeWithdrawn(to, amount);
    }

    // ========================= INTERNAL =========================
    function _recover(bytes32 digest, bytes calldata sig)
        internal pure returns (address)
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

    receive() external payable {}
}

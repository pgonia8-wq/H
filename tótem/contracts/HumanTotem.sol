// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IOracle {
    function getScore(address user) external view returns (uint256);
    function getMetrics(address user) external view returns (
        uint256 score,
        uint256 influence,
        uint256 timestamp
    );
}

interface ITotemRegistry {
    function status(address user) external view returns (
        bool fraudLocked,
        uint256 level,
        uint256 badge
    );
}

/**
 * @title HumanTotem
 * @notice Activo líquido que representa un TÓTEM (avatar humano), no un usuario.
 * @dev Production-grade:
 *      - Cache por bloque (gas optimized)
 *      - Protección contra oracle stale
 *      - Exención owner (AMM safe)
 *      - Penalización dinámica por score
 *      - Naming semántico correcto (avatar ≠ token financiero puro)
 */
contract HumanTotem is ERC20, Ownable, ReentrancyGuard {

    // ========================= CORE =========================

    IOracle public immutable oracle;
    ITotemRegistry public immutable registry;

    address public immutable totemAvatar; // 🔥 nombre correcto (antes humanSubject)
    address public treasury;

    // ========================= CONFIG =========================

    uint256 public constant SCORE_THRESHOLD_LOW = 4000;
    uint256 public constant SCORE_THRESHOLD_CRITICAL = 2000;
    uint256 public constant MAX_SCORE_STALENESS = 10 minutes;

    uint256 public baseFeeBps = 0;
    uint256 public penaltyFeeBps = 1000; // base referencia

    // ========================= CACHE =========================

    struct ScoreCache {
        uint256 score;
        bool fraudLocked;
        uint256 blockNumber;
    }

    ScoreCache private _cache;

    // ========================= EVENTS =========================

    event ReputationPenaltyApplied(
        address indexed from,
        uint256 fee,
        uint256 score
    );

    event TreasuryUpdated(address indexed treasury);

    // ========================= ERRORS =========================

    error HumanFraudDetected();
    error StaleScore();
    error ZeroAddress();

    // ========================= CONSTRUCTOR =========================

    constructor(
        string memory name,     // Ej: "Totem José"
        string memory symbol,   // Ej: "TJOS"
        address _totemAvatar,
        address _oracle,
        address _registry,
        address _treasury
    ) ERC20(name, symbol) Ownable(msg.sender) {
        if (
            _totemAvatar == address(0) ||
            _oracle == address(0) ||
            _registry == address(0) ||
            _treasury == address(0)
        ) revert ZeroAddress();

        totemAvatar = _totemAvatar;
        oracle = IOracle(_oracle);
        registry = ITotemRegistry(_registry);
        treasury = _treasury;
    }

    // ========================= MINT =========================

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // ========================= CACHE =========================

    function _getCachedStatus()
        private
        returns (uint256 score, bool fraudLocked)
    {
        if (_cache.blockNumber == block.number) {
            return (_cache.score, _cache.fraudLocked);
        }

        (uint256 s,, uint256 ts) = oracle.getMetrics(totemAvatar);

        // 🔒 Protección contra oracle viejo
        if (ts > 0 && block.timestamp - ts > MAX_SCORE_STALENESS) {
            revert StaleScore();
        }

        (bool locked,,) = registry.status(totemAvatar);

        _cache = ScoreCache({
            score: s,
            fraudLocked: locked,
            blockNumber: block.number
        });

        return (s, locked);
    }

    // ========================= TRANSFER =========================

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {

        (uint256 score, bool locked) = _getCachedStatus();

        // 1. Bloqueo total si fraude
        if (locked) revert HumanFraudDetected();

        uint256 finalAmount = amount;

        // 🔥 CRÍTICO: EXENCIÓN OWNER (AMM SAFE)
        if (from != owner()) {

            if (score < SCORE_THRESHOLD_LOW) {

                uint256 feeBps = _calculateDynamicFee(score);

                if (feeBps > 0) {
                    uint256 fee = (amount * feeBps) / 10_000;

                    if (fee > 0) {
                        super._transfer(from, treasury, fee);
                        finalAmount = amount - fee;

                        emit ReputationPenaltyApplied(from, fee, score);
                    }
                }
            }
        }

        super._transfer(from, to, finalAmount);
    }

    // ========================= FEE LOGIC =========================

    function _calculateDynamicFee(uint256 score)
        internal
        view
        returns (uint256)
    {
        if (score < SCORE_THRESHOLD_CRITICAL) return 2000; // 20%
        if (score < SCORE_THRESHOLD_LOW) return 1000;      // 10%
        return baseFeeBps;
    }

    // ========================= ADMIN =========================

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    // ========================= VIEW =========================

    /**
     * @notice Permite a wallets / frontend verificar estado antes de transferir
     */
    function getHumanHealth()
        external
        view
        returns (uint256 score, bool isLocked)
    {
        score = oracle.getScore(totemAvatar);
        (isLocked,,) = registry.status(totemAvatar);
    }
}

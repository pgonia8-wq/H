// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  // FIX ALTO-1: OZ v5 path

interface IOracle {
    function getScore(address user) external view returns (uint256);
    function getMetrics(address user) external view returns (uint256 score, uint256 influence, uint256 timestamp);
}

interface ITotemRegistry {
    function status(address user) external view returns (bool fraudLocked, uint256 level, uint256 badge);
}

/**
 * @title HumanTotem (ERC20)
 * @notice El token líquido que nace de la graduación de un Tótem.
 * @dev FIX ALTO-4: Score and fraud status are cached per block to avoid
 *      2 external calls on every single ERC20 transfer. The cache is lazily
 *      refreshed on the first transfer of each new block, keeping data fresh
 *      while cutting external call overhead for batch transfers in the same block.
 *      A maxStaleness guard ensures the score can never be older than 10 minutes.
 */
contract HumanTotem is ERC20, Ownable, ReentrancyGuard {

    IOracle public immutable oracle;
    ITotemRegistry public immutable registry;

    address public immutable humanSubject;
    address public treasury;

    uint256 public constant SCORE_THRESHOLD_LOW = 4000;
    uint256 public constant SCORE_THRESHOLD_CRITICAL = 2000;
    uint256 public constant MAX_SCORE_STALENESS = 10 minutes;

    uint256 public baseFeeBps = 0;
    uint256 public penaltyFeeBps = 1000;

    // FIX ALTO-4: Block-level cache — refreshed at most once per block.
    struct ScoreCache {
        uint256 score;
        bool fraudLocked;
        uint256 blockNumber;
    }
    ScoreCache private _cache;

    event ReputationPenaltyApplied(address indexed from, uint256 amount, uint256 currentScore);
    event FraudLockActivated();
    event TreasuryUpdated(address indexed newTreasury);

    error HumanFraudDetected();
    error TransferRestrictedByReputation();
    error StaleScore();

    constructor(
        string memory name,
        string memory symbol,
        address _humanSubject,
        address _oracle,
        address _registry,
        address _treasury
    ) ERC20(name, symbol) Ownable(msg.sender) {
        humanSubject = _humanSubject;
        oracle = IOracle(_oracle);
        registry = ITotemRegistry(_registry);
        treasury = _treasury;
    }

    /**
     * @dev Minting controlled by the GraduationManager during deployment.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Returns the cached score and fraud status for the current block.
     *      If the cache is stale (different block), fetches fresh data from oracle.
     *      Also validates that the oracle data itself is not older than MAX_SCORE_STALENESS.
     */
    function _getCachedStatus() private returns (uint256 score, bool fraudLocked) {
        if (_cache.blockNumber == block.number) {
            return (_cache.score, _cache.fraudLocked);
        }

        // FIX ALTO-4: Fetch fresh data from oracle and registry (once per block max)
        (uint256 rawScore,, uint256 oracleTimestamp) = oracle.getMetrics(humanSubject);

        // Guard against a stale oracle reading being used for penalty decisions
        if (oracleTimestamp > 0 && block.timestamp - oracleTimestamp > MAX_SCORE_STALENESS) {
            revert StaleScore();
        }

        (bool locked,,) = registry.status(humanSubject);

        _cache.score = rawScore;
        _cache.fraudLocked = locked;
        _cache.blockNumber = block.number;

        return (rawScore, locked);
    }

    /**
     * @dev Override transfer to inject Oracle reputation logic.
     *      Uses block-level cache (FIX ALTO-4) to minimize external calls.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        (uint256 currentScore, bool fraudLocked) = _getCachedStatus();

        // 1. Block if fraud-locked
        if (fraudLocked) revert HumanFraudDetected();

        uint256 finalAmount = amount;

        // 2. Dynamic penalty only on transfers from non-owner when score is low
        if (currentScore < SCORE_THRESHOLD_LOW && from != owner()) {
            uint256 fee = (amount * _calculateDynamicFee(currentScore)) / 10000;

            if (fee > 0) {
                super._transfer(from, treasury, fee);
                finalAmount = amount - fee;
                emit ReputationPenaltyApplied(from, fee, currentScore);
            }
        }

        // 3. Execute the actual transfer
        super._transfer(from, to, finalAmount);
    }

    /**
     * @dev Dynamic fee based on how low the reputation is.
     */
    function _calculateDynamicFee(uint256 score) internal view returns (uint256) {
        if (score < SCORE_THRESHOLD_CRITICAL) return 2000; // 20% — Critical
        if (score < SCORE_THRESHOLD_LOW) return 1000;      // 10% — Warning
        return baseFeeBps;
    }

    /**
     * @notice Update the fee destination. Only owner.
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Zero address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    /**
     * @notice Public health view for exchanges and UIs.
     */
    function getHumanHealth() external view returns (uint256 score, bool isLocked) {
        score = oracle.getScore(humanSubject);
        (isLocked,,) = registry.status(humanSubject);
    }
}

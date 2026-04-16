// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

interface IOracle {
    function getScore(address user) external view returns (uint256);
}

contract TotemBondingCurve is ReentrancyGuard, Ownable {

    IERC20 public immutable wldToken;
    IRegistry public immutable registry;
    IOracle public immutable oracle;

    address public treasury;

    // 🔥 Multi Totem
    mapping(address => address) public totemOwner;

    // 🔒 Balances por usuario
    mapping(address => mapping(address => uint256)) public balances;

    // 🔒 Supply real por tótem
    mapping(address => uint256) public realSupply;

    // 🔒 Ventana de venta
    struct SellWindow {
        uint256 sold;
        uint256 lastReset;
    }

    mapping(address => mapping(address => SellWindow)) public sellWindows;

    uint256 public constant SELL_WINDOW = 1 days;
    uint256 public maxSellBps = 4500; // 45%

    // 🔒 Límites económicos
    uint256 public constant OWNER_MAX_BPS = 2500; // 25%
    uint256 public constant USER_MAX_BPS = 1000;  // 10%

    // 🔒 Curva (intacta)
    uint256 public constant INITIAL_PRICE_WLD = 55 * 10**7;
    uint256 public constant SCALE = 1e20;
    uint256 public constant CURVE_K = 235;

    uint256 public constant BUY_FEE_BPS = 200;
    uint256 public constant SELL_FEE_BPS = 300;
    uint256 public constant FEE_DENOMINATOR = 10_000;

    uint256 public constant SCORE_MIN = 925;
    uint256 public constant SCORE_MAX = 1075;
    uint256 public constant SCORE_BASE = 1000;

    // EVENTS
    event Buy(address indexed totem, address indexed user, uint256 wldIn, uint256 tokensOut);
    event Sell(address indexed totem, address indexed user, uint256 tokensIn, uint256 wldOut);
    event TreasuryUpdated(address treasury);
    event TotemOwnerSet(address indexed totem, address indexed owner);

    // ERRORS
    error NotATotem();
    error ZeroAmount();
    error InsufficientBalance();
    error SlippageExceeded();
    error OracleAnomaly();
    error MaxPositionExceeded();
    error SellLimitExceeded();

    constructor(
        address _wld,
        address _registry,
        address _oracle,
        address _treasury
    ) Ownable(msg.sender) {
        wldToken = IERC20(_wld);
        registry = IRegistry(_registry);
        oracle = IOracle(_oracle);
        treasury = _treasury;
    }

    // ================= ADMIN =================

    function setTotemOwner(address totem, address owner) external onlyOwner {
        require(owner != address(0), "zero");
        totemOwner[totem] = owner;
        emit TotemOwnerSet(totem, owner);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setMaxSellBps(uint256 _bps) external onlyOwner {
        require(_bps <= 10000, "invalid");
        maxSellBps = _bps;
    }

    // ================= CORE =================

    function _g(uint256 score) internal pure returns (uint256) {
        if (score < SCORE_MIN || score > SCORE_MAX) revert OracleAnomaly();
        return score;
    }

    function V(uint256 s) public pure returns (uint256) {
        uint256 linear = INITIAL_PRICE_WLD * s;
        uint256 s2 = (s * s) / SCALE;
        uint256 s3 = (s2 * s) / SCALE;
        uint256 cubic = (CURVE_K * s3) / 3;
        return linear + cubic;
    }

    function dV(uint256 s) public pure returns (uint256) {
        uint256 s2 = (s * s) / SCALE;
        return INITIAL_PRICE_WLD + (CURVE_K * s2);
    }

    function _effective(uint256 real, uint256 score) internal pure returns (uint256) {
        return (real * score) / SCORE_BASE;
    }

    function _solveBuyEff(uint256 s0Eff, uint256 wldIn) internal pure returns (uint256 s1Eff) {
        uint256 target = V(s0Eff) + wldIn;

        s1Eff = s0Eff + (wldIn * 1e18) / dV(s0Eff);

        for (uint256 i = 0; i < 10; i++) {
            uint256 v1 = V(s1Eff);
            int256 f = int256(v1) - int256(target);
            int256 df = int256(dV(s1Eff));

            if (df == 0 || f == 0) return s1Eff;

            int256 delta = f / df;
            if (delta == 0) return s1Eff;

            int256 maxStep = int256(s1Eff) / 4;
            if (delta > maxStep) delta = maxStep;
            if (delta < -maxStep) delta = -maxStep;

            if (delta > 0) s1Eff -= uint256(delta);
            else s1Eff += uint256(-delta);
        }

        uint256 low = s0Eff;
        uint256 high = s1Eff > s0Eff ? s1Eff : s0Eff + 1;

        while (V(high) < target) {
            high *= 2;
        }

        for (uint256 i = 0; i < 32; i++) {
            uint256 mid = (low + high) / 2;
            uint256 v = V(mid);

            if (v > target) high = mid;
            else low = mid;
        }

        return (low + high) / 2;
    }

    // ================= BUY =================

    function buy(address totem, uint256 amountWldIn, uint256 minTokensOut) external nonReentrant {

        if (!registry.isTotem(msg.sender)) revert NotATotem();
        if (!registry.isTotem(totem)) revert NotATotem();
        if (amountWldIn == 0) revert ZeroAmount();

        // 🔒 GENESIS RULE
        if (realSupply[totem] == 0) {
            require(msg.sender == totemOwner[totem], "only owner initializes");
        }

        uint256 score = _g(oracle.getScore(totem));

        uint256 fee = (amountWldIn * BUY_FEE_BPS) / FEE_DENOMINATOR;
        uint256 netWld = amountWldIn - fee;

        uint256 s0Eff = _effective(realSupply[totem], score);
        uint256 s1Eff = _solveBuyEff(s0Eff, netWld);

        uint256 tokensOut = ((s1Eff - s0Eff) * SCORE_BASE) / score;

        if (tokensOut < minTokensOut) revert SlippageExceeded();

        uint256 newBalance = balances[totem][msg.sender] + tokensOut;

        // 🔥 FIX CRÍTICO
        uint256 supplyAfter = realSupply[totem] + tokensOut;

        uint256 max;
        if (msg.sender == totemOwner[totem]) {
            max = (supplyAfter * OWNER_MAX_BPS) / 10000;
        } else {
            max = (supplyAfter * USER_MAX_BPS) / 10000;
        }

        if (newBalance > max) revert MaxPositionExceeded();

        require(wldToken.transferFrom(msg.sender, address(this), netWld), "transfer fail");
        require(wldToken.transferFrom(msg.sender, treasury, fee), "fee fail");

        balances[totem][msg.sender] = newBalance;
        realSupply[totem] += tokensOut;

        emit Buy(totem, msg.sender, amountWldIn, tokensOut);
    }

    // ================= SELL =================

    function sell(address totem, uint256 tokensIn, uint256 minWldOut) external nonReentrant {

        if (!registry.isTotem(msg.sender)) revert NotATotem();
        if (!registry.isTotem(totem)) revert NotATotem();
        if (tokensIn == 0) revert ZeroAmount();

        uint256 userBalance = balances[totem][msg.sender];
        if (tokensIn > userBalance) revert InsufficientBalance();

        SellWindow storage w = sellWindows[totem][msg.sender];

        if (block.timestamp > w.lastReset + SELL_WINDOW) {
            w.sold = 0;
            w.lastReset = block.timestamp;
        }

        uint256 maxSell = (userBalance * maxSellBps) / 10000;
        if (w.sold + tokensIn > maxSell) revert SellLimitExceeded();

        uint256 score = _g(oracle.getScore(totem));

        uint256 s0Real = realSupply[totem];
        uint256 s0Eff = _effective(s0Real, score);

        uint256 deltaEff = (tokensIn * score) / SCORE_BASE;
        uint256 s1Eff = s0Eff - deltaEff;

        uint256 baseValue = V(s0Eff) - V(s1Eff);
        uint256 fee = (baseValue * SELL_FEE_BPS) / FEE_DENOMINATOR;
        uint256 payout = baseValue - fee;

        if (payout < minWldOut) revert SlippageExceeded();

        balances[totem][msg.sender] -= tokensIn;
        realSupply[totem] -= tokensIn;
        w.sold += tokensIn;

        require(wldToken.transfer(msg.sender, payout), "payout fail");
        require(wldToken.transfer(treasury, fee), "fee fail");

        emit Sell(totem, msg.sender, tokensIn, payout);
    }
}

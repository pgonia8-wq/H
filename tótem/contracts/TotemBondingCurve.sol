// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

interface IOracle {
    function getInfluence(address user) external view returns (uint256); // base 1000
}

contract TotemBondingCurve is ReentrancyGuard, Ownable {

    IERC20 public immutable wldToken;
    IRegistry public immutable registry;
    IOracle public immutable oracle;
    address public treasury;

    // ====================== CURVA EXACTA ======================
    uint256 public constant INITIAL_PRICE_WLD = 55 * 10**7;
    uint256 public constant SCALE = 1e20;
    uint256 public constant CURVE_K = 235;

    uint256 public constant BUY_FEE_BPS = 200;
    uint256 public constant SELL_FEE_BPS = 300;
    uint256 public constant FEE_DENOMINATOR = 10_000;

    // Penalidad máxima 7.5% (92.5 - 107.5)
    uint256 public constant INFLUENCE_MIN = 925;
    uint256 public constant INFLUENCE_MAX = 1075;
    uint256 public constant INFLUENCE_BASE = 1000;

    // Distribución del excedente
    uint256 public constant RESERVE_PERCENT = 500;   // 5% reserva pool
    uint256 public constant TREASURY_PERCENT = 250;  // 2.5% treasury

    mapping(address => uint256) public globalSupply;

    event Buy(address indexed totem, uint256 wldIn, uint256 tokensOut, uint256 influence);
    event Sell(address indexed totem, uint256 tokensIn, uint256 wldOut, uint256 influence);
    event TreasuryUpdated(address newTreasury);

    constructor(
        address _wld,
        address _registry,
        address _oracle,
        address _initialTreasury
    ) Ownable(msg.sender) {
        wldToken = IERC20(_wld);
        registry = IRegistry(_registry);
        oracle = IOracle(_oracle);
        treasury = _initialTreasury;
    }

    function V(uint256 s) public pure returns (uint256) {
        uint256 linear = INITIAL_PRICE_WLD * s;
        uint256 cubic = (CURVE_K * s * s * s) / (3 * SCALE);
        return linear + cubic;
    }

    function previewBuy(address totem, uint256 amountWldIn) public view returns (uint256 tokensOut) {
        if (!registry.isTotem(totem)) revert NotATotem();
        if (amountWldIn == 0) revert ZeroAmount();

        uint256 s0 = globalSupply[totem];
        uint256 s1 = s0 + amountWldIn;

        uint256 baseValue = V(s1) - V(s0);

        uint256 fee = (baseValue * BUY_FEE_BPS) / FEE_DENOMINATOR;
        tokensOut = baseValue - fee;
    }

    function previewSell(address totem, uint256 tokensIn) public view returns (uint256 wldOut) {
        if (!registry.isTotem(totem)) revert NotATotem();
        if (tokensIn == 0) revert ZeroAmount();

        uint256 s0 = globalSupply[totem];
        if (tokensIn > s0) revert InsufficientSupply();

        uint256 s1 = s0 - tokensIn;

        uint256 baseValue = V(s0) - V(s1);

        uint256 influence = _getBoundedInfluence(totem);
        uint256 influencedWld = (baseValue * influence) / INFLUENCE_BASE;

        uint256 fee = (influencedWld * SELL_FEE_BPS) / FEE_DENOMINATOR;
        wldOut = influencedWld - fee;
    }

    function buy(address totem, uint256 amountWldIn, uint256 minTokensOut) external nonReentrant {
        uint256 tokensOut = previewBuy(totem, amountWldIn);
        if (tokensOut < minTokensOut) revert SlippageExceeded();

        uint256 influence = _getBoundedInfluence(totem);

        uint256 fee = (amountWldIn * BUY_FEE_BPS) / FEE_DENOMINATOR;
        uint256 netWld = amountWldIn - fee;

        require(wldToken.transferFrom(msg.sender, address(this), netWld), "WLD transfer failed");
        require(wldToken.transfer(treasury, fee), "Fee transfer failed");

        uint256 supplyShift = (netWld * influence) / INFLUENCE_BASE;
        globalSupply[totem] += supplyShift;

        emit Buy(totem, amountWldIn, tokensOut, influence);
    }

    function sell(address totem, uint256 tokensIn, uint256 minWldOut) external nonReentrant {
        uint256 wldOut = previewSell(totem, tokensIn);
        if (wldOut < minWldOut) revert SlippageExceeded();

        if (globalSupply[totem] < tokensIn) revert InsufficientSupply();

        uint256 influence = _getBoundedInfluence(totem);
        uint256 s0 = globalSupply[totem];
        uint256 s1 = s0 - tokensIn;
        uint256 baseValue = V(s0) - V(s1);

        uint256 influencedWld = (baseValue * influence) / INFLUENCE_BASE;
        uint256 surplus = baseValue - influencedWld;

        uint256 reserveTake = (surplus * RESERVE_PERCENT) / FEE_DENOMINATOR;   // 5% reserva
        uint256 treasuryTake = (surplus * TREASURY_PERCENT) / FEE_DENOMINATOR; // 2.5% treasury

        uint256 sellFee = (influencedWld * SELL_FEE_BPS) / FEE_DENOMINATOR;
        uint256 finalPayout = influencedWld - sellFee;

        require(wldToken.transfer(msg.sender, finalPayout), "Payout failed");
        require(wldToken.transfer(treasury, sellFee + treasuryTake), "Treasury failed");

        uint256 supplyReduction = (tokensIn * influence) / INFLUENCE_BASE;
        globalSupply[totem] = globalSupply[totem] > supplyReduction 
            ? globalSupply[totem] - supplyReduction 
            : 0;

        emit Sell(totem, tokensIn, finalPayout, influence);
    }

    function _getBoundedInfluence(address totem) internal view returns (uint256) {
        uint256 inf = oracle.getInfluence(totem);
        if (inf < INFLUENCE_MIN) return INFLUENCE_MIN;
        if (inf > INFLUENCE_MAX) return INFLUENCE_MAX;
        return inf;
    }

    function getSupply(address totem) external view returns (uint256) {
        return globalSupply[totem];
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Zero address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury); // Agrega este evento si quieres
    }
}

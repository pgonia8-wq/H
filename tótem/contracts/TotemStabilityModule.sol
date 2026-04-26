// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // [H-05 FIX] OZ v5 path
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // [CRÍTICO-2 FIX] necesario para leer LP balance

interface ICurve {
    function getPrice(address totem) external view returns (uint256);
}

interface IMetrics {
    function getVolume(address totem) external view returns (uint256);
}

interface IOracle {
    function getScore(address user) external view returns (uint256);
}

interface IFeeRouter {
    function harvest() external;
    function executeBuyback(uint256 amount) external;
    function lpToken() external view returns (address); // [CRÍTICO-2 FIX] expone getter ya existente (public immutable)
}

contract TotemStabilityModule is Ownable2Step, ReentrancyGuard {

    ICurve public curve;
    IMetrics public metrics;
    IOracle public oracle;
    IFeeRouter public feeRouter;

    uint256 public lastPrice;
    uint256 public lastVolume;

    uint256 public stressIndex; // 0 - 100

    uint256 public baseBuybackRate = 40;
    uint256 public maxBuybackRate = 85;

    uint256 public cooldown = 6 hours;
    uint256 public lastStabilization;

    event StressUpdated(uint256 stress);
    event Stabilized(uint256 buybackRate, uint256 amount);

    constructor(address _curve, address _metrics, address _oracle, address _feeRouter) Ownable(msg.sender) { // [COMPILE FIX] OZ v5 requiere initialOwner explícito
        curve = ICurve(_curve);
        metrics = IMetrics(_metrics);
        oracle = IOracle(_oracle);
        feeRouter = IFeeRouter(_feeRouter);
    }

    function calculateStress(
        uint256 currentPrice,
        uint256 currentVolume,
        uint256 avgReputation
    ) public view returns (uint256) {

        uint256 priceDrop = lastPrice > currentPrice
            ? ((lastPrice - currentPrice) * 100) / lastPrice
            : 0;

        uint256 volumeDrop = lastVolume > currentVolume
            ? ((lastVolume - currentVolume) * 100) / lastVolume
            : 0;

        uint256 repRisk = avgReputation < 800 ? 30 : 10;

        uint256 stress = (priceDrop + volumeDrop + repRisk) / 3;

        if (stress > 100) stress = 100;

        return stress;
    }

    function getBuybackRate(uint256 stress) public view returns (uint256) {
        if (stress < 20) return baseBuybackRate;

        if (stress < 50) {
            return baseBuybackRate + ((stress - 20) * 2);
        }

        return maxBuybackRate;
    }

    /**
     * @notice Stabilize: ejecuta buyback proporcional al stress y luego distribuye el remanente.
     *
     * ORDEN CANÓNICO DE EJECUCIÓN (no revertir este orden — ver [CRÍTICO-2 FIX]):
     *   1. Calcular LP disponible en feeRouter (balance ERC20, NO ETH).
     *   2. Ejecutar buyback proporcional al stress (skip si redondea a 0).
     *   3. Ejecutar harvest sobre el remanente (40/40/20 inalterado).
     *
     * Este orden es el comportamiento canónico del módulo. El orden inverso
     * (harvest → buyback) NO funciona porque harvest vacía el balance.
     */
    function stabilize(address totem) external nonReentrant {

        require(block.timestamp > lastStabilization + cooldown, "cooldown");

        uint256 price = curve.getPrice(totem);
        uint256 volume = metrics.getVolume(totem);
        uint256 rep = oracle.getScore(totem);

        uint256 stress = calculateStress(price, volume, rep);

        stressIndex = stress;

        uint256 rate = getBuybackRate(stress);

        // [CRÍTICO-2 FIX] Dos correcciones mínimas que NO alteran el modelo económico:
        //   1. Leer balance del LP token (ERC20) en vez de balance ETH del contrato.
        //      address(feeRouter).balance siempre era 0 (feeRouter no recibe ETH).
        //   2. Calcular el buyback ANTES de harvest. harvest() vacía todo el balance
        //      LP del feeRouter (40/40/20), por lo que leerlo después daba 0.
        //   El rate, la fórmula de stress y la distribución interna de harvest
        //   permanecen intactos.
        uint256 available = IERC20(feeRouter.lpToken()).balanceOf(address(feeRouter));
        uint256 buybackAmount = (available * rate) / 100;

        if (buybackAmount > 0) {
            feeRouter.executeBuyback(buybackAmount);
        }

        feeRouter.harvest();

        lastPrice = price;
        lastVolume = volume;
        lastStabilization = block.timestamp;

        emit StressUpdated(stress);
        emit Stabilized(rate, buybackAmount);
    }
}

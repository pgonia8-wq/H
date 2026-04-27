// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // [H-05 FIX] OZ v5 path
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Pair {
    function transfer(address to, uint value) external returns (bool);
    function balanceOf(address owner) external view returns (uint);
}

contract TotemFeeRouter is Ownable2Step, ReentrancyGuard {

    address public immutable lpToken; // LP token del AMM pair
    address public treasury;
    address public buybackVault;
    address public rewardPool;
    address public stabilityModule; // [ALTO-1 FIX] autorizado para invocar executeBuyback

    uint256 public lastCheckpoint;

    event FeesHarvested(uint256 amount);
    event Distributed(uint256 treasury, uint256 buyback, uint256 rewards);
    event StabilityModuleUpdated(address indexed module); // [ALTO-1 FIX]

    constructor(
        address _lpToken,
        address _treasury,
        address _buybackVault,
        address _rewardPool
    ) Ownable(msg.sender) { // [COMPILE FIX] OZ v5 requiere initialOwner explícito
        require(_lpToken != address(0), "zero");

        lpToken = _lpToken;
        treasury = _treasury;
        buybackVault = _buybackVault;
        rewardPool = _rewardPool;
    }

    // ---------------- CORE ----------------

    function harvest() external nonReentrant {

        uint256 balance = IERC20(lpToken).balanceOf(address(this));

        require(balance > 0, "no fees");

        // simple split model
        uint256 treasuryShare = (balance * 40) / 100;
        uint256 buybackShare = (balance * 40) / 100;
        uint256 rewardShare = balance - treasuryShare - buybackShare;

        require(IERC20(lpToken).transfer(treasury, treasuryShare), "treasury fail");
        require(IERC20(lpToken).transfer(buybackVault, buybackShare), "buyback fail");
        require(IERC20(lpToken).transfer(rewardPool, rewardShare), "reward fail");

        lastCheckpoint = block.timestamp;

        emit FeesHarvested(balance);
        emit Distributed(treasuryShare, buybackShare, rewardShare);
    }

    // [C-05 FIX] executeBuyback requerido por TotemStabilityModule.
    // Transfiere `amount` de LP tokens al buybackVault de forma directa.
    // [ALTO-1 FIX] Restringido a stabilityModule + owner. Antes era público,
    // lo que permitía a cualquier dirección descoordinar el flujo de stabilize
    // vaciando LP justo antes de que el módulo leyera el balance.
    function executeBuyback(uint256 amount) external nonReentrant {
        require(
            msg.sender == stabilityModule || msg.sender == owner(),
            "not authorized"
        );
        require(amount > 0, "zero");
        require(IERC20(lpToken).balanceOf(address(this)) >= amount, "insufficient");
        require(IERC20(lpToken).transfer(buybackVault, amount), "buyback fail");
    }

    // ---------------- ADMIN ----------------

    function setTreasury(address _t) external onlyOwner {
        treasury = _t;
    }

    function setBuybackVault(address _b) external onlyOwner {
        buybackVault = _b;
    }

    function setRewardPool(address _r) external onlyOwner {
        rewardPool = _r;
    }

    // [ALTO-1 FIX] Autoriza al TotemStabilityModule para invocar executeBuyback.
    // Debe llamarse después del deploy del módulo. Mientras sea address(0),
    // solo el owner puede ejecutar buyback (default conservador y seguro).
    function setStabilityModule(address _m) external onlyOwner {
        stabilityModule = _m;
        emit StabilityModuleUpdated(_m);
    }
}

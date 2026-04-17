// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

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
 * @dev Este token consulta constantemente al Oracle para ajustar sus reglas económicas.
 */
contract HumanTotem is ERC20, Ownable, ReentrancyGuard {

    IOracle public immutable oracle;
    ITotemRegistry public immutable registry;
    
    address public immutable humanSubject; // El humano al que pertenece este token
    address public treasury;               // Destino de las multas por mala reputación

    // Configuración de penalizaciones
    uint256 public constant SCORE_THRESHOLD_LOW = 4000; // Reputación peligrosa
    uint256 public constant SCORE_THRESHOLD_CRITICAL = 2000; 
    
    uint256 public baseFeeBps = 0; // 0% inicial
    uint256 public penaltyFeeBps = 1000; // 10% de multa si el score es crítico

    event ReputationPenaltyApplied(address indexed from, uint256 amount, uint256 currentScore);
    event FraudLockActivated();

    error HumanFraudDetected();
    error TransferRestrictedByReputation();

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
     * @dev Función de minting controlada por el GraduationManager durante el despliegue.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Sobrescribe la transferencia para inyectar la lógica del Oracle.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        // 1. Verificar bloqueo por fraude en el Registry de World ID
        (bool fraudLocked,,) = registry.status(humanSubject);
        if (fraudLocked) revert HumanFraudDetected();

        // 2. Consultar Score actual del humano
        uint256 currentScore = oracle.getScore(humanSubject);
        
        uint256 finalAmount = amount;

        // 3. Lógica de penalización dinámica (Solo en Ventas o transferencias de salida)
        // Si el score baja del umbral crítico, se aplica una tasa que va al treasury
        if (currentScore < SCORE_THRESHOLD_LOW && from != owner()) {
            uint256 fee = (amount * _calculateDynamicFee(currentScore)) / 10000;
            
            if (fee > 0) {
                super._transfer(from, treasury, fee);
                finalAmount = amount - fee;
                emit ReputationPenaltyApplied(from, fee, currentScore);
            }
        }

        // 4. Ejecutar transferencia final
        super._transfer(from, to, finalAmount);
    }

    /**
     * @dev Calcula la comisión basada en qué tan baja es la reputación.
     */
    function _calculateDynamicFee(uint256 score) internal view returns (uint256) {
        if (score < SCORE_THRESHOLD_CRITICAL) return 2000; // 20% de multa (Crítico)
        if (score < SCORE_THRESHOLD_LOW) return 1000;      // 10% de multa (Aviso)
        return baseFeeBps;
    }

    /**
     * @notice Permite al protocolo actualizar el destino de las multas.
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Zero address");
        treasury = _newTreasury;
    }

    /**
     * @notice Vista pública para que exchanges vean el "Estado de Salud" del token.
     */
    function getHumanHealth() external view returns (uint256 score, bool isLocked) {
        score = oracle.getScore(humanSubject);
        (isLocked,,) = registry.status(humanSubject);
    }
}

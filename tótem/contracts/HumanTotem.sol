// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HumanTotem
 * @dev Este contrato representa el valor económico de un humano. 
 * Es compatible con Uniswap (ERC20) pero está regido por la ética (Reputación).
 */
interface ITotemReputation {
    function status(address user) external view returns (
        bool fraudLocked,
        uint256 level,
        uint256 badge
    );
}

contract HumanTotem is ERC20, Ownable {

    address public immutable humanId;      // El humano al que representa este Tótem
    ITotemReputation public immutable sbt; // El contrato de identidad (SBT)

    // Eventos para transparencia
    event ReputationRestricted(address indexed from, uint256 level);
    event FraudLockTriggered(address indexed human);

    /**
     * @param _name Nombre del humano (ej: "Juan")
     * @param _symbol Símbolo para el mercado (ej: "TUX-JUAN")
     * @param _human Dirección del humano poseedor del Tótem
     * @param _sbt Dirección de tu contrato Totem.sol (el de la reputación)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _human,
        address _sbt
    ) ERC20(
        string(abi.encodePacked("Totem de ", _name)), 
        _symbol
    ) Ownable(msg.sender) {
        require(_human != address(0), "Zero address");
        humanId = _human;
        sbt = ITotemReputation(_sbt);
    }

    /**
     * @dev Sobrescribimos la función de transferencia para inyectar la "Variante Humana".
     * Esta regla se aplica en CUALQUIER movimiento, incluido Uniswap.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        // 1. Consultar el estado del humano en el contrato de Reputación
        (bool fraudLocked, uint256 level, ) = sbt.status(humanId);

        // 2. REGLA DE ORO: Si hay fraude, el Tótem se congela globalmente.
        // Ninguna ballena ni el dueño puede mover el valor si la ética se rompe.
        if (fraudLocked) {
            revert("Mercado Bloqueado: Humano bajo investigacion de fraude");
        }

        // 3. REGLA DE NIVEL: Protección de Inversores.
        // Si el nivel baja de 2, restringimos la capacidad de venta del dueño
        // para evitar que abandone el proyecto (Rug Pull) tras portarse mal.
        if (level < 2 && from == humanId) {
            uint256 maxSell = totalSupply() / 200; // Máximo 0.5% del supply por trade
            require(value <= maxSell, "Nivel bajo: Venta restringida para proteger al mercado");
            emit ReputationRestricted(from, level);
        }

        // 4. Continuar con la transferencia si todo es correcto
        super._update(from, to, value);
    }

    /**
     * @dev Función para emitir el suministro inicial. 
     * Solo puede ser llamada por el GraduationManager durante el despliegue.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Devuelve el humano detrás de este activo.
     */
    function getHuman() external view returns (address) {
        return humanId;
    }
}

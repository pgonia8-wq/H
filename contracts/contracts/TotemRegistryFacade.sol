// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

// [COMPILE FIX] Interfaces movidas fuera del contrato — Solidity no permite
// declarar interfaces anidadas dentro de un contract. Cero cambio semántico.
interface IIdentityRegistry {
    function hasTotem(address user) external view returns (bool);
    function isBlocked(address user) external view returns (bool);
}

interface ITotemNFT {
    function status(address user)
        external
        view
        returns (bool fraudLocked, uint256 level, uint256 badge);
}

/**
 * @title TotemRegistryFacade
 * @notice Fachada unificada del registro. Implementa ITotemCore combinando
 *         TotemRegistry (isTotem) y Totem.sol (status/level/badge).
 *
 * [C-03 FIX] Un único punto de entrada reemplaza IRegistry e ITotemRegistry
 *            en todos los contratos del ecosistema.
 *
 * [C-01 FIX] Acepta address(0) en el constructor — las referencias se
 *            establecen post-deploy con setIdentityRegistry/setTotemContract,
 *            eliminando la dependencia circular de despliegue.
 */
contract TotemRegistryFacade is Ownable2Step {

    // ── Storage ────────────────────────────────────────────────────────────

    address public identityRegistry; // TotemRegistry — fuente de hasTotem/isBlocked
    address public totemContract;    // Totem.sol     — fuente de level/badge/fraudLocked

    // ── Events ────────────────────────────────────────────────────────────

    event IdentityRegistryUpdated(address indexed registry);
    event TotemContractUpdated(address indexed totem);

    // ── Errors ────────────────────────────────────────────────────────────

    error ZeroAddress();
    error NotConfigured();

    // ── Constructor ───────────────────────────────────────────────────────
    // Ambas direcciones pueden ser address(0) en el deploy inicial.

    constructor(address _identityRegistry, address _totemContract)
        Ownable(msg.sender)
    {
        identityRegistry = _identityRegistry;
        totemContract    = _totemContract;
    }

    // ── ITotemCore ────────────────────────────────────────────────────────

    function isTotem(address user) external view returns (bool) {
        if (identityRegistry == address(0)) return false;
        return IIdentityRegistry(identityRegistry).hasTotem(user)
            && !IIdentityRegistry(identityRegistry).isBlocked(user);
    }

    function status(address user)
        external
        view
        returns (bool fraudLocked, uint256 level, uint256 badge)
    {
        if (totemContract == address(0)) revert NotConfigured();
        return ITotemNFT(totemContract).status(user);
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function setIdentityRegistry(address _registry) external onlyOwner {
        if (_registry == address(0)) revert ZeroAddress();
        identityRegistry = _registry;
        emit IdentityRegistryUpdated(_registry);
    }

    function setTotemContract(address _totem) external onlyOwner {
        if (_totem == address(0)) revert ZeroAddress();
        totemContract = _totem;
        emit TotemContractUpdated(_totem);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

// [COMPILE FIX] Interface movida fuera del contrato — Solidity no permite
// declarar interfaces anidadas dentro de un contract. Cero cambio semántico:
// la interface conserva su firma exacta y solo se usa internamente por TotemFactory.
interface IFacadeAdmin {
    function setIdentityRegistry(address _registry) external;
    function setTotemContract(address _totem) external;
    function transferOwnership(address newOwner) external;
}

/**
 * @title TotemFactory
 * @notice Despliega y conecta TotemRegistry + Totem.sol + TotemRegistryFacade
 *         en una transacción atómica.
 *
 * [C-01 FIX] Elimina la dependencia circular de deploy. El orden garantizado es:
 *
 *   1. Facade (con address(0) — acepta placeholders)
 *   2. IdentityRegistry (recibe la dirección de la Facade)
 *   3. TotemNFT (recibe IdentityRegistry como registry)
 *   4. Facade.setIdentityRegistry(identityRegistry)
 *   5. Facade.setTotemContract(totemNFT)
 *   6. Transferir ownership de la Facade al finalOwner
 *
 * Si algún paso falla, toda la transacción revierte — nunca hay un estado
 * intermedio con punteros incorrectos en producción.
 */
contract TotemFactory is Ownable2Step {

    // ── Resultado del deploy ──────────────────────────────────────────────

    struct CoreContracts {
        address identityRegistry;
        address totemNFT;
        address facade;
        bool deployed;
    }

    CoreContracts public core;

    // ── Bytecode a desplegar (se carga antes del deploy) ─────────────────

    bytes public identityRegistryBytecode;
    bytes public totemNFTBytecode;
    bytes public registryFacadeBytecode;

    // ── Events & Errors ───────────────────────────────────────────────────

    event CoreDeployed(
        address indexed identityRegistry,
        address indexed totemNFT,
        address indexed facade
    );

    error AlreadyDeployed();
    error BytecodeNotSet();
    error ZeroAddress();

    constructor() Ownable(msg.sender) {}

    // ── Configurar bytecodes ──────────────────────────────────────────────

    function setBytecodes(
        bytes calldata _identityRegistry,
        bytes calldata _totemNFT,
        bytes calldata _facade
    ) external onlyOwner {
        identityRegistryBytecode = _identityRegistry;
        totemNFTBytecode         = _totemNFT;
        registryFacadeBytecode   = _facade;
    }

    // ── Deploy atómico ────────────────────────────────────────────────────

    /**
     * @param worldIdVerifier  Verificador WorldID ya desplegado
     * @param oracle           TotemOracle ya desplegado
     * @param curve            TotemBondingCurve ya desplegada
     * @param finalOwner       Multisig/DAO que recibirá el ownership de la Facade
     */
    function deployCore(
        address worldIdVerifier,
        address oracle,
        address curve,
        address finalOwner
    ) external onlyOwner returns (
        address identityRegistry,
        address totemNFT,
        address facade
    ) {
        if (core.deployed) revert AlreadyDeployed();
        if (
            identityRegistryBytecode.length == 0 ||
            totemNFTBytecode.length == 0 ||
            registryFacadeBytecode.length == 0
        ) revert BytecodeNotSet();
        if (finalOwner == address(0)) revert ZeroAddress();

        // Paso 1: Facade con placeholders (acepta address(0))
        facade = _deploy(abi.encodePacked(
            registryFacadeBytecode,
            abi.encode(address(0), address(0))
        ));

        // Paso 2: IdentityRegistry apuntando a la Facade como IRegistry
        identityRegistry = _deploy(abi.encodePacked(
            identityRegistryBytecode,
            abi.encode(worldIdVerifier, facade)
        ));

        // Paso 3: TotemNFT usando IdentityRegistry real
        totemNFT = _deploy(abi.encodePacked(
            totemNFTBytecode,
            abi.encode(identityRegistry, oracle, curve)
        ));

        // Paso 4: Conectar Facade con las direcciones reales
        IFacadeAdmin(facade).setIdentityRegistry(identityRegistry);
        IFacadeAdmin(facade).setTotemContract(totemNFT);

        // Paso 5: Ceder control al finalOwner
        IFacadeAdmin(facade).transferOwnership(finalOwner);

        core = CoreContracts({
            identityRegistry: identityRegistry,
            totemNFT: totemNFT,
            facade: facade,
            deployed: true
        });

        emit CoreDeployed(identityRegistry, totemNFT, facade);
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _deploy(bytes memory bytecode) internal returns (address addr) {
        assembly {
            addr := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        require(addr != address(0), "deploy failed");
    }
}

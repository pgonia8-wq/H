// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TotemUltimateRouter is Ownable2Step, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // --- EIP-712 & STORAGE ---
    bytes32 private immutable _DOMAIN_SEPARATOR;
    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public usedIntents;
    mapping(address => uint256) public pendingReturns; // Seguridad financiera

    // --- IMMUTABLE DEPENDENCIES (GAS SAVER) ---
    ICurve public immutable curve;
    IRegistry public immutable registry;
    IAttestation public immutable attestation;

    // --- ORACLE CONSENSUS ---
    IOracle[3] public oracles;

    constructor(address _curve, address _reg, address _attest, address[3] memory _oracles) Ownable(msg.sender) {
        curve = ICurve(_curve);
        registry = IRegistry(_reg);
        attestation = IAttestation(_attest);
        for(uint i=0; i<3; i++) oracles[i] = IOracle(_oracles[i]);

        _DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("TotemProtocol")),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }

    // --- CORE EXECUTION ---
    function executeIntent(
        address user,
        uint256 maxPrice,
        uint256 deadline,
        bytes32 action,
        bytes calldata signature
    ) external payable nonReentrant whenNotPaused {
        // 1. Integridad de la Firma
        bytes32 intentId = _calculateIntentHash(user, maxPrice, deadline, action, nonces[user]++);
        require(!usedIntents[intentId], "Intent already used");
        _verifySignature(user, intentId, signature);
        require(block.timestamp <= deadline, "Intent Expired");
        
        // 2. Validación de Humanidad
        require(attestation.isHuman(user), "Not a verified human");

        // 3. Ley de la Curva Cúbica (Inviolable)
        uint256 supply = registry.totalSupply();
        uint256 price = curve.getPrice(supply);
        require(price <= maxPrice, "Price exceeds maxPrice (Slippage)");
        require(msg.value >= price, "Insufficient payment for cubic price");

        // 4. Consenso de Métricas
        (uint256 score, uint256 influence) = _getConsensus(user);

        // 5. Ejecución Atómica
        usedIntents[intentId] = true;
        _handleExecution(user, action, price, score);

        // 6. Gestión de Excedentes (Pull-over-Push)
        if (msg.value > price) {
            pendingReturns[user] += (msg.value - price);
        }
    }

    // --- INTERNAL HELPERS ---
    function _getConsensus(address user) internal view returns (uint256 s, uint256 i) {
        uint256[3] memory s_vals;
        uint256[3] memory i_vals;
        for(uint8 idx=0; idx<3; idx++) {
            (s_vals[idx], i_vals[idx], ) = oracles[idx].getMetrics(user);
        }
        s = _median(s_vals[0], s_vals[1], s_vals[2]);
        i = _median(i_vals[0], i_vals[1], i_vals[2]);
    }

    function _median(uint256 a, uint256 b, uint256 c) internal pure returns (uint256) {
        if ((a >= b && a <= c) || (a <= b && a >= c)) return a;
        if ((b >= a && b <= c) || (b <= a && b >= c)) return b;
        return c;
    }

    // ... (Firma y Withdraw functions)
}

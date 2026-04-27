# PLAN DE REDISEÑO Y CORRECCIÓN — TOTEM PROTOCOL
**Versión**: 1.0  
**Basado en**: TOTEM_AUDIT_REPORT.md v3 (auditoría sistémica)  
**Objetivo**: Plan ejecutable de fixes priorizados con código de referencia, dependencias y validación.

---

## ÍNDICE

1. [Estrategia General](#1-estrategia-general)
2. [Fase 0 — Pre-requisitos](#fase-0--pre-requisitos)
3. [Fase 1 — Bloqueadores de Deploy (Críticos)](#fase-1--bloqueadores-de-deploy-críticos)
4. [Fase 2 — Coherencia del Modelo (Altos)](#fase-2--coherencia-del-modelo-altos)
5. [Fase 3 — Robustez (Medios)](#fase-3--robustez-medios)
6. [Fase 4 — Limpieza y Hardening (Informativos)](#fase-4--limpieza-y-hardening-informativos)
7. [Estrategia de Testing](#estrategia-de-testing)
8. [Plan de Despliegue](#plan-de-despliegue)
9. [Matriz de Dependencias entre Fixes](#matriz-de-dependencias)
10. [Checklist Final pre-Mainnet](#checklist-final-pre-mainnet)

---

## 1. ESTRATEGIA GENERAL

### Principios rectores

1. **Mantener la arquitectura actual**. La defensa en profundidad de 9 capas es sólida — los fixes son quirúrgicos, no rediseños arquitecturales.
2. **Preservar interfaces externas**. Cambios internos no deben romper contratos ya integrados (Oracle, Registry, Curve).
3. **Defensa en profundidad sobre fix puntual**. Cada fix se complementa con tests de invariante.
4. **Migrabilidad**. Los fixes deben poder aplicarse vía Governance timelock cuando sea posible (sin re-deploy del sistema completo).

### Clasificación de fixes por tipo de cambio

| Tipo | Implicación |
|------|-------------|
| **CODE-FIX** | Modificación de lógica en un contrato existente — requiere re-deploy del contrato afectado |
| **WIRING-FIX** | Re-conectar contratos vía setters administrativos — no requiere re-deploy |
| **CONFIG-FIX** | Ajuste de parámetro on-chain — vía Governance |
| **DOC-FIX** | Cambio de runbook / documentación operativa — sin código |

---

## FASE 0 — PRE-REQUISITOS

Antes de iniciar cualquier fix:

### 0.1 Setup de entorno
```bash
# Estructura recomendada
totem-protocol/
├── contracts/          # Contratos Solidity
├── test/
│   ├── unit/           # Tests unitarios por contrato
│   ├── integration/    # Tests cross-contract (sistémicos)
│   └── invariant/      # Tests de invariantes (Foundry)
├── scripts/
│   ├── deploy/         # Scripts de deploy
│   └── migrations/     # Scripts de governance proposals
└── audits/             # Esta auditoría + fixes documentados
```

### 0.2 Infraestructura de tests
- **Foundry** para invariant testing (esencial dado el sistema de bonding curve y graduación).
- **Hardhat** para integración con OpenZeppelin Defender / multisig.
- **Slither + Mythril** en CI antes de cada PR.

### 0.3 Multisig y Governance
- Definir multisig (recomendado **Safe 3-of-5**) como `owner` definitivo de:
  - `TotemRegistry`
  - `TotemAttestation`
  - `TotemControl`
  - `TotemGovernance`
  - `TotemTreasury`
- Ningún EOA debe quedar como owner en producción.

---

## FASE 1 — BLOQUEADORES DE DEPLOY (CRÍTICOS)

### FIX-C1: Completar `TotemIntentRouter`

**Tipo**: CODE-FIX  
**Prioridad**: P0 (bloqueante)  
**Esfuerzo**: 5-8 días dev + auditoría puntual

#### Diagnóstico
El contrato termina con `// ... (Firma y Withdraw functions)` — funciones críticas no implementadas:
- `_verifySignature(intent, sigs)` — verificación EIP-712 de las 3 firmas de oráculos
- `_handleExecution(intent)` — branch lógico por `intent.action` (`BUY` / `SELL` / `MIGRATE` / `STAKE`)
- `_calculateIntentHash(intent)` — hash determinístico anti-replay
- `withdraw(token, to, amount)` — recuperación administrativa

#### Diseño propuesto

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract TotemIntentRouter is EIP712, ReentrancyGuard, Ownable2Step {

    using ECDSA for bytes32;

    // === FIX ALTO-2: Defensa en profundidad — verificar AMBAS fuentes ===
    ITotemCore public immutable registry;
    ITotemAttestation public immutable attestation;

    // Quórum de 2-de-3 oráculos para firmar intents
    address[3] public oracleSigners;
    uint256 public constant QUORUM = 2;

    mapping(bytes32 => bool) public usedIntentHashes;

    bytes32 private constant INTENT_TYPEHASH = keccak256(
        "Intent(address user,uint8 action,address target,uint256 amount,uint256 nonce,uint256 deadline)"
    );

    error NotHuman();
    error NotRegistered();              // FIX ALTO-2
    error InsufficientQuorum();
    error IntentExpired();
    error IntentReplay();
    error InvalidSigner();
    error UnknownAction();

    constructor(
        address _registry,
        address _attestation,
        address[3] memory _signers
    ) EIP712("TotemIntentRouter", "1") {
        registry = ITotemCore(_registry);
        attestation = ITotemAttestation(_attestation);
        oracleSigners = _signers;
    }

    function executeIntent(
        Intent calldata intent,
        bytes[3] calldata sigs
    ) external nonReentrant {
        // === FIX ALTO-2: defensa en profundidad ===
        if (!registry.isTotem(intent.user)) revert NotRegistered();
        if (!attestation.isHuman(intent.user)) revert NotHuman();

        if (block.timestamp > intent.deadline) revert IntentExpired();

        bytes32 intentHash = _calculateIntentHash(intent);
        if (usedIntentHashes[intentHash]) revert IntentReplay();
        usedIntentHashes[intentHash] = true;

        _verifySignature(intentHash, sigs);
        _handleExecution(intent);
    }

    function _calculateIntentHash(Intent calldata intent)
        internal view returns (bytes32)
    {
        return _hashTypedDataV4(keccak256(abi.encode(
            INTENT_TYPEHASH,
            intent.user,
            intent.action,
            intent.target,
            intent.amount,
            intent.nonce,
            intent.deadline
        )));
    }

    function _verifySignature(bytes32 hash, bytes[3] calldata sigs) internal view {
        uint256 valid;
        bool[3] memory seen;
        for (uint256 i = 0; i < 3; i++) {
            address recovered = hash.recover(sigs[i]);
            for (uint256 j = 0; j < 3; j++) {
                if (oracleSigners[j] == recovered && !seen[j]) {
                    seen[j] = true;
                    valid++;
                    break;
                }
            }
        }
        if (valid < QUORUM) revert InsufficientQuorum();
    }

    function _handleExecution(Intent calldata intent) internal {
        if (intent.action == ACTION_BUY) {
            // Delegar a curve con autorización del usuario (vía permit/approval previo)
            ...
        } else if (intent.action == ACTION_SELL) {
            ...
        } else {
            revert UnknownAction();
        }
    }

    function withdraw(address token, address to, uint256 amount)
        external onlyOwner
    {
        if (token == address(0)) {
            (bool ok,) = payable(to).call{value: amount}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(token).transfer(to, amount);
        }
    }
}
```

#### Tests de invariante asociados
- `invariant_intent_hash_uniqueness` — un mismo hash nunca se ejecuta dos veces.
- `invariant_quorum_enforcement` — sin 2 firmas válidas, executeIntent siempre revierte.
- `invariant_dual_humanity_check` — siempre se verifica `registry.isTotem` Y `attestation.isHuman`.

---

### FIX-C2: Reparar `TotemStabilityModule.stabilize`

**Tipo**: CODE-FIX  
**Prioridad**: P0  
**Esfuerzo**: 2-3 días dev

#### Diagnóstico
```solidity
// ANTES (roto):
feeRouter.harvest();                              // distribuye LP tokens
uint256 available = address(feeRouter).balance;   // lee ETH = 0
uint256 buybackAmount = (available * rate) / 100; // = 0
feeRouter.executeBuyback(buybackAmount);          // revierte
```

Dos problemas:
1. **Bug de tipo**: lee balance ETH en vez de balance LP token.
2. **Race lógico**: `harvest` ya distribuyó los fondos antes del cálculo del buyback.

#### Diseño propuesto

**Opción A (mínima — preservar arquitectura)**:
```solidity
function stabilize(address totem) external nonReentrant {
    StabilityState storage s = state[totem];
    require(block.timestamp >= s.lastStabilization + COOLDOWN, "cooldown");

    // 1. Obtener balance ANTES de harvest (LP tokens disponibles)
    uint256 available = IERC20(lpToken).balanceOf(address(feeRouter));

    // 2. Calcular buyback rate basado en stress index
    uint256 stress = _calculateStress(totem);
    uint256 rate = stress > 75 ? 50 : stress > 50 ? 25 : 10;
    uint256 buybackAmount = (available * rate) / 100;
    require(buybackAmount > 0, "no LP available");

    // 3. Ejecutar buyback ANTES del harvest general
    feeRouter.executeBuyback(buybackAmount);

    // 4. Distribuir el remanente
    feeRouter.harvest();

    // 5. Persistir estado
    s.lastStabilization = block.timestamp;
    s.lastStressIndex = stress;
    emit Stabilized(totem, stress, buybackAmount);
}
```

**Opción B (rediseño)**: separar `feeRouter` en dos vaults:
- `tradingFeesVault` — recibe fees de buy/sell.
- `stabilityReserve` — porción reservada para buybacks (X% de cada harvest).

`stabilize` consume solo del `stabilityReserve`, que es independiente de las distribuciones del harvest.

**Recomendado**: Opción B para producción. Opción A como hotfix transicional.

#### Tests de invariante
- `invariant_stabilize_progresses` — tras stabilize exitoso, `lastStabilization` se actualiza.
- `invariant_no_double_spend` — el balance disponible nunca se cuenta dos veces (harvest + buyback).

---

## FASE 2 — COHERENCIA DEL MODELO (ALTOS)

### FIX-A1: Access Control en `TotemFeeRouter.executeBuyback`

**Tipo**: CODE-FIX  
**Prioridad**: P1  
**Esfuerzo**: 1 día

```solidity
// ANTES
function executeBuyback(uint256 amount) external {
    require(amount > 0, "zero");
    IERC20(lpToken).transfer(buybackVault, amount);
}

// DESPUÉS
address public stabilityModule;

modifier onlyStabilityOrOwner() {
    require(msg.sender == stabilityModule || msg.sender == owner(), "unauthorized");
    _;
}

function setStabilityModule(address _module) external onlyOwner {
    stabilityModule = _module;
    emit StabilityModuleUpdated(_module);
}

function executeBuyback(uint256 amount) external onlyStabilityOrOwner {
    require(amount > 0, "zero");
    IERC20(lpToken).safeTransfer(buybackVault, amount);
    emit BuybackExecuted(amount);
}
```

**Dependencia**: FIX-C2 debe completarse primero (define el contrato autorizado).

---

### FIX-A2: Unificar Verificación de Humanidad en IntentRouter

**Tipo**: CODE-FIX  
**Prioridad**: P1 (incluido en FIX-C1)  
**Esfuerzo**: incluido en FIX-C1

Documentado en FIX-C1: `executeIntent` debe verificar AMBOS `registry.isTotem` Y `attestation.isHuman`.

**Decisión arquitectural complementaria**: ¿debe existir `TotemAttestation` separado?

**Recomendación**: convertir `TotemAttestation` en un **sub-componente** de `TotemRegistry`:
- Eliminar contrato standalone.
- Agregar `mapping(address => bool) attestationOverride` en Registry.
- `isTotem` retorna `(hasTotem || attestationOverride) && !isBlocked`.
- Solo el owner puede setear `attestationOverride` (con timelock).

Esto elimina la inconsistencia de raíz. Sin embargo, requiere migración de estado — opción para v2 del protocolo.

---

### FIX-A3: Anti-Dump Global por Totem

**Tipo**: CODE-FIX + CONFIG-FIX  
**Prioridad**: P1  
**Esfuerzo**: 2-3 días

#### Diagnóstico
`maxSellBps` aplica solo a single-wallet. Un atacante coordinado con N wallets puede vender N × ~45%.

#### Diseño propuesto
Agregar límite global por totem además del límite por wallet:

```solidity
// Nuevo storage
mapping(address => SellWindow) public globalSellWindow;
uint256 public constant GLOBAL_SELL_BPS = 2000; // 20% del supply por día

function sell(address totem, uint256 tokensIn, uint256 minWldOut) external {
    ... // chequeos existentes

    // === NUEVO: límite global ===
    SellWindow storage gw = globalSellWindow[totem];
    if (block.timestamp > gw.lastReset + SELL_WINDOW) {
        gw.sold = 0;
        gw.lastReset = block.timestamp;
    }
    uint256 globalCap = (realSupply[totem] * GLOBAL_SELL_BPS) / 10000;
    if (gw.sold + tokensIn > globalCap) revert GlobalSellLimitExceeded();
    gw.sold += tokensIn;

    ... // resto de lógica
}
```

**Trade-off explícito**: bloquea ventas legítimas durante crashes. Considerar:
- Excepción si el seller es el creador (evitar locking del creator).
- Aumentar el % global durante eventos especiales (governance).

---

### FIX-A4: Check `isBlocked[newUser]` en `executeMigration`

**Tipo**: CODE-FIX  
**Prioridad**: P1  
**Esfuerzo**: 0.5 día

```solidity
function executeMigration(address newUser) external notPaused {
    MigrationRequest memory req = migrationRequests[newUser];
    if (req.requestedAt == 0) revert MigrationNotRequested();
    if (!req.approved) revert MigrationNotApproved();
    if (block.timestamp < req.requestedAt + MIGRATION_DELAY) revert MigrationDelayNotMet();

    // === FIX ALTO-4: prevenir bricking ===
    if (isBlocked[newUser]) revert BlockedUserCannotReceive();

    address oldUser = req.oldUser;
    ITotem(TOTEM).migrateToken(oldUser, newUser);
    ...
}
```

**Adicionalmente**: agregar mecanismo de cancelación de migration request si `newUser` es bloqueado durante el delay:
```solidity
function cancelMigrationDueToBlock(address newUser) external {
    require(isBlocked[newUser], "not blocked");
    delete migrationRequests[newUser];
    emit MigrationCancelled(newUser);
}
```

---

### FIX-A5: Mitigar Stale Score en HumanTotem

**Tipo**: CODE-FIX + CONFIG-FIX  
**Prioridad**: P1  
**Esfuerzo**: 2 días

#### Diseño propuesto

```solidity
// ANTES
uint256 public constant MAX_SCORE_STALENESS = 10 minutes;

function _transfer(address from, address to, uint256 amount) internal {
    (uint256 score,, uint256 ts) = oracle.getMetrics(avatar);
    if (block.timestamp - ts > MAX_SCORE_STALENESS) revert StaleScore();
    ...
}

// DESPUÉS
uint256 public maxScoreStaleness = 6 hours;       // ajustable
uint256 public emergencyStaleness = 7 days;       // hard cap
uint256 public lastKnownScore;
uint256 public lastKnownScoreAt;

function _transfer(address from, address to, uint256 amount) internal {
    (uint256 score,, uint256 ts) = oracle.getMetrics(avatar);
    
    if (block.timestamp - ts <= maxScoreStaleness) {
        // Path normal: usar score fresco
        lastKnownScore = score;
        lastKnownScoreAt = ts;
    } else if (block.timestamp - ts <= emergencyStaleness) {
        // Path degradado: usar último score conocido
        score = lastKnownScore;
        emit DegradedMode(block.timestamp - ts);
    } else {
        // Hard fail: oracle abandonado
        revert OracleAbandoned();
    }
    ...
}

function setMaxScoreStaleness(uint256 _value) external onlyAdmin {
    require(_value <= emergencyStaleness, "exceeds emergency");
    maxScoreStaleness = _value;
}
```

**Defensa en profundidad**: agregar keeper económico que actualice oracle si ha pasado >50% del staleness window, recibiendo recompensa pequeña del treasury.

---

## FASE 3 — ROBUSTEZ (MEDIOS)

### FIX-M1: Slippage Protection en `_createAMM`

**Tipo**: CODE-FIX  
**Prioridad**: P2  
**Esfuerzo**: 1 día

```solidity
function _createAMM(...) internal {
    address pair = IUniswapV2Factory(factory).createPair(token, wldToken);
    
    // Validar que el pair no exista previamente (no front-run)
    require(IUniswapV2Pair(pair).totalSupply() == 0, "pair pre-existed");
    
    IERC20(token).approve(router, amountTokenWei);
    IERC20(wldToken).approve(router, amountWLD);
    
    // Min amounts = 99% (1% de slippage tolerado)
    uint256 minToken = (amountTokenWei * 99) / 100;
    uint256 minWLD = (amountWLD * 99) / 100;
    
    (uint256 actualToken, uint256 actualWLD,) = IUniswapV2Router(router).addLiquidity(
        token, wldToken, amountTokenWei, amountWLD,
        minToken, minWLD,
        user, block.timestamp + 300
    );
    
    require(actualToken >= minToken && actualWLD >= minWLD, "slippage");
}
```

---

### FIX-M2: Métricas Consistentes Buy vs Sell

**Tipo**: CODE-FIX  
**Prioridad**: P2  
**Esfuerzo**: 0.5 día

```solidity
// En TotemBondingCurve.buy:
metrics.recordBuy(totem, netWld);   // antes: amountWldIn — ahora neto

// En TotemBondingCurve.sell:
metrics.recordSell(totem, baseValue);  // antes: payout — ahora bruto
```

Ambos ahora registran el **valor bruto pre-fee** o ambos el **neto post-fee** consistentemente. Documentar la elección.

---

### FIX-M3: Cota Superior en `verifyVolume`

**Tipo**: CODE-FIX  
**Prioridad**: P2  
**Esfuerzo**: 1 día

```solidity
uint256 public constant MAX_VERIFY_MULTIPLIER = 2;

function verifyVolume(address totem, uint256 amount, bytes calldata sig) external {
    _verifyAuthorizedSigner(totem, amount, sig);
    
    Market storage m = markets[totem];
    require(amount <= m.rawVolume * MAX_VERIFY_MULTIPLIER, "exceeds rawVolume*K");
    
    m.verifiedVolume = amount;
    emit VolumeVerified(totem, amount);
}
```

---

### FIX-M4: Reducir Riesgo de `emergencySetFee`

**Tipo**: CODE-FIX  
**Prioridad**: P3  
**Esfuerzo**: 0.5 día

Opción A: Eliminar `emergencySetFee` (preferida — el delay de 1h de Control ya es bajo).

Opción B: Requerir multisig 4-of-5 para emergencySetFee, vs 2-of-5 para flujo normal.

---

### FIX-M5: Validación de `code.length` en `TotemFactory._deploy`

**Tipo**: CODE-FIX  
**Prioridad**: P3  
**Esfuerzo**: 0.25 día

```solidity
function _deploy(bytes memory bytecode) internal returns (address addr) {
    assembly {
        addr := create(0, add(bytecode, 0x20), mload(bytecode))
    }
    require(addr != address(0), "deploy failed");
    require(addr.code.length > 0, "empty code");
}
```

---

### FIX-M6: Distribución Automática en `TotemAccessGateway`

**Tipo**: CODE-FIX  
**Prioridad**: P3  
**Esfuerzo**: 1 día

```solidity
address public treasury;
uint256 public constant AUTO_FORWARD_THRESHOLD = 1 ether;

function query(...) external payable {
    ... // lógica existente
    
    if (address(this).balance >= AUTO_FORWARD_THRESHOLD) {
        uint256 amount = address(this).balance;
        (bool ok,) = payable(treasury).call{value: amount}("");
        if (ok) emit ForwardedToTreasury(amount);
    }
}
```

---

## FASE 4 — LIMPIEZA Y HARDENING (INFORMATIVOS)

### FIX-I1: Unificar Interfaces (todos los contratos)
**Tipo**: CODE-FIX  
**Esfuerzo**: 2 días

Eliminar interfaces locales en:
- `TotemRegistry.sol` (IWorldIDVerifier)
- `Totem.sol` (IRegistry, IOracle, IBondingCurve)
- `TotemBondingCurve.sol` (IRegistry, IOracle, IMetrics)
- `TotemCoreRouter.sol` (todas)

Importar desde `ITotemInterfaces.sol` exclusivamente.

### FIX-I2: Slippage Default en `TotemBondingCurve.buy`
Si `minTokensOut == 0`, calcular un slippage máximo del 5% basado en el precio actual.

### FIX-I3: Documentar Procedimiento de Migración
Runbook operacional con:
- Paso a paso para validar nullifierHash criptográficamente
- Plantilla de comunicación al usuario
- Logs requeridos antes de aprobar
- Excepciones que requieren multisig adicional

### FIX-I4: Documentar GROUP_ID
Comentario explícito en `TotemRegistry`: "GROUP_ID = 1 → Orb verification (Worldcoin Mini-App). Cambiar requiere re-deploy."

### FIX-I5: Eliminar/Conectar `TotemScoreLib` y `TotemAntiManipulationLayer`
- Si no se usan: eliminar de la base de código.
- Si se planea usar: integrar explícitamente y agregar tests.

### FIX-I6: Mutabilidad en `TotemReader`
Convertir direcciones en `setRegistry()` / `setOracle()` con `onlyOwner`. Asume Reader es solo-lectura, no crítico.

---

## ESTRATEGIA DE TESTING

### Cobertura mínima requerida

| Tipo | Cobertura | Herramienta |
|------|-----------|-------------|
| Unit | 95% líneas, 100% branches críticas | Foundry forge |
| Integration | Flujos end-to-end (createTotem → buy → sell → graduate → AMM trade) | Hardhat + Foundry |
| Invariant | 10K+ runs por invariante | Foundry invariant |
| Fuzz | 100K runs en lógica de bonding curve | Foundry fuzz / Echidna |
| Static | Slither, Mythril en CI | GitHub Actions |
| Formal | Certora para invariantes críticos (opcional) | Certora Prover |

### Invariantes críticos a verificar

1. **`sum(balances[totem][*]) == realSupply[totem]`** — sin tokens fantasma.
2. **`hasTotem[user]` ⇒ `totemNullifier[user] != 0`** — no hay totems sin nullifier.
3. **Un nullifier ⇒ máximo una dirección activa** (`nullifierToAddress[n]`).
4. **Si `migratedNullifiers[n]` ⇒ ese nullifier nunca puede ser usado en `createTotem`**.
5. **`graduate` ⇒ `frozen[totem]` permanente**.
6. **Tras `executeMigration` ⇒ `tokenOf[oldUser] == 0` y `tokenOf[newUser] != 0`**.
7. **`stabilize` ⇒ `lastStabilization` avanza** (no race).
8. **Cualquier `executeIntent` ⇒ `registry.isTotem(user) == true` Y `attestation.isHuman(user) == true`**.

### Test sistémico clave: ataque coordinado de N wallets

```solidity
function test_coordinatedDump_blockedByGlobalLimit() public {
    // 5 wallets compran cada una 10% del supply (USER_MAX_BPS)
    // Intentar vender 45% de cada → debería revertir por GLOBAL_SELL_BPS = 20%
}
```

---

## PLAN DE DESPLIEGUE

### Fase Alpha — Testnet (Worldchain Sepolia)
**Duración**: 4 semanas

Semana 1:
- Deploy de contratos con FIX-C1, FIX-C2 aplicados.
- Setup de multisig.
- Tests de integración.

Semana 2-3:
- Bug bounty privado (5-10 auditores).
- Aplicar FIX-A1..A5.

Semana 4:
- Re-auditoría externa (firma diferente a la actual).
- Aplicar FIX-M1..M6.

### Fase Beta — Mainnet con caps
**Duración**: 6 semanas

- Deploy en mainnet con `maxFee` reducido (TotemControl).
- `withdrawPeriod` agresivo en Treasury (rate limit estricto).
- Cap de supply por totem temporal.
- Bug bounty público (Immunefi).

### Fase GA
- Remover caps temporales vía Governance.
- Habilitar IntentRouter (post-fix).
- Activar StabilityModule (post-fix).

---

## MATRIZ DE DEPENDENCIAS

```
FIX-C1 (IntentRouter completo)
   ├── depende de: ITotemInterfaces (FIX-I1) ← preferible
   └── habilita: tests de FIX-A2 (verificación dual humanidad)

FIX-C2 (StabilityModule)
   ├── depende de: nada
   └── habilita: FIX-A1 (access control buyback usa stabilityModule)

FIX-A1 (executeBuyback access)
   └── depende de: FIX-C2 (define stabilityModule)

FIX-A2 (humanidad dual)
   └── incluido en FIX-C1

FIX-A3 (anti-dump global)
   └── independiente

FIX-A4 (block check migration)
   └── independiente — rápido

FIX-A5 (stale score)
   └── independiente

FIX-M1..M6
   └── independientes entre sí

FIX-I1 (interfaces unificadas)
   └── refactor preventivo, antes de tests masivos
```

### Orden recomendado de implementación

```
Sprint 1 (Semana 1-2):  FIX-I1 → FIX-C1 → FIX-C2 → FIX-A1 → FIX-A4
Sprint 2 (Semana 3-4):  FIX-A2 (validación) → FIX-A3 → FIX-A5
Sprint 3 (Semana 5):    FIX-M1..M6
Sprint 4 (Semana 6):    FIX-I2..I6 + documentación + tests finales
```

---

## CHECKLIST FINAL PRE-MAINNET

### Código
- [ ] Todos los CRÍTICOS implementados y testeados
- [ ] Todos los ALTOS implementados y testeados
- [ ] MEDIOS implementados o documentados como aceptados
- [ ] INFOs resueltos o tracked
- [ ] 0 warnings de Slither/Mythril en categorías High/Medium
- [ ] Coverage ≥ 95% líneas, 100% branches críticas

### Operacional
- [ ] Multisig 3-of-5 desplegado y testeado
- [ ] Runbook de migración escrito y aprobado
- [ ] Runbook de respuesta a incidentes (pause de emergencia)
- [ ] Keepers de oracle configurados (con incentivo económico)
- [ ] Monitoreo on-chain (Tenderly / OpenZeppelin Defender Sentinels)
- [ ] Plan de comunicación pública pre-launch

### Seguridad
- [ ] Re-auditoría externa completada (firma diferente)
- [ ] Bug bounty público activo (Immunefi mínimo $250K)
- [ ] Insurance / cover (Nexus Mutual o equivalente)
- [ ] Plan de upgrade vía Governance documentado y probado en testnet

### Económico
- [ ] Caps temporales en mainnet (max supply por totem, max fee)
- [ ] Treasury rate limits configurados
- [ ] Liquidez inicial provisionada en pares estratégicos

### Comunicación
- [ ] Whitepaper actualizado con modelo de seguridad
- [ ] Documentación de usuario final (cómo verificar humanidad, cómo migrar)
- [ ] Disclosure responsable de hallazgos previos

---

## ESTIMACIÓN GLOBAL

| Categoría | Esfuerzo (dev-días) | Costo aprox. (USD a $800/día) |
|-----------|---------------------|--------------------------------|
| Fase 1 (Críticos)         | 10-12  | $8K-10K   |
| Fase 2 (Altos)            | 8-10   | $6K-8K    |
| Fase 3 (Medios)           | 5-7    | $4K-6K    |
| Fase 4 (Informativos)     | 4-5    | $3K-4K    |
| Testing exhaustivo        | 15-20  | $12K-16K  |
| Re-auditoría externa      | —      | $40K-80K  |
| Bug bounty (cap)          | —      | $50K-250K |
| **TOTAL técnico**         | **~50 dev-días** | **$120K-370K** |

**Cronograma**: 8-12 semanas calendario hasta mainnet GA.

---

## CONCLUSIÓN

El plan se basa en la premisa de que **la arquitectura del Totem Protocol es sólida**. Los fixes son quirúrgicos:

1. **2 críticos** son bugs concretos (IntentRouter incompleto, bug de tipo en Stability) — corregibles en 2 sprints.
2. **5 altos** son refinamientos de coherencia (verificación dual de humanidad, access control, anti-dump global, edge cases de migration y staleness) — directos de aplicar.
3. **6 medios + 8 informativos** son hardening incremental.

Con la implementación completa de este plan, el protocolo estaría en condiciones de mainnet con un perfil de riesgo aceptable. La inversión en re-auditoría externa y bug bounty es **no negociable** dado el modelo de identidad humana en juego.

---
*Plan basado en TOTEM_AUDIT_REPORT.md v3 (auditoría sistémica de los 24 contratos).*

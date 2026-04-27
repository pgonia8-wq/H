# INFORME DE AUDITORÍA DE SEGURIDAD — TOTEM PROTOCOL (v3)
**Versión**: 3.0 — Auditoría sistémica (24 contratos analizados en conjunto)  
**Fecha**: 23 de Abril de 2026  
**Alcance**: Análisis estático + modelo de seguridad sistémico + vectores de ataque verificados contra el conjunto

---

## METODOLOGÍA

A diferencia de las versiones anteriores, esta auditoría parte del **modelo de seguridad sistémico**: cómo los 24 contratos cooperan para defender el protocolo en profundidad. Los hallazgos se evalúan considerando si las protecciones de OTROS contratos mitigan el supuesto problema.

---

# PARTE A — MODELO DE SEGURIDAD DEL CONJUNTO

## A.1. Capas de Defensa por Función Crítica

### Capa 1 — Identidad humana (verificación Sybil)
```
                ┌──────────────────┐
                │   World ID       │  ← prueba ZK Orb (groupId=1)
                │   (off-chain)    │
                └────────┬─────────┘
                         │ proof
                         ▼
         ┌───────────────────────────────┐
         │  TotemRegistry.createTotem    │  ← verifyProof + nullifierHash
         │  (signal = msg.sender)         │     único + signal-binding
         └───────────────┬───────────────┘
                         │
                         ▼
                  hasTotem[user]
                  + isBlocked[user]
                         │
                         ▼
         ┌───────────────────────────────┐
         │  TotemRegistryFacade.isTotem  │  ← single source of truth
         └───────────────────────────────┘
```

**Defensa**: signal binding + nullifier único + Orb-only + admin block list. Tres llaves criptográficas independientes.

### Capa 2 — Operaciones de mercado (bonding curve)
```
buy/sell  →  registry.isTotem(totem)  ← solo totems registrados pueden ser tradeados
          →  USER_MAX_BPS = 10%        ← max posición por wallet
          →  OWNER_MAX_BPS = 25%       ← max posición creador
          →  maxSellBps = 45% / 24h    ← anti-dump por wallet
          →  oracle score-multiplier   ← curve adapta precio a reputación
          →  ReentrancyGuard           ← protección estándar
```

**Defensa**: 4 capas independientes contra acumulación + dump.

### Capa 3 — Acceso a queries y datos de oráculo
```
TotemAccessGateway.query
   ├─ registry.isTotem(msg.sender)           ← solo humanos pueden pagar query
   ├─ limiter.check(user, ACTION_QUERY)      ← rate limit por nivel
   ├─ EIP-712 signature de oracle authoriz.  ← datos firmados off-chain
   ├─ MAX_DATA_AGE = 2 min                   ← anti-stale
   ├─ priceToleranceBps = 2%                 ← anti-underpricing
   └─ minScore (UX)                          ← user-defined threshold
```

**Defensa**: 6 verificaciones encadenadas. Robusta.

### Capa 4 — Actualización del oracle (anti-manipulación)
```
TotemOracle.update
   ├─ registry.isTotem(totem)                ← solo totems
   ├─ UPDATE_FEE = 0.01 ETH                  ← anti-spam económico
   ├─ SCORE_MIN/MAX = [975, 1025]            ← rango limitado
   ├─ EIP-712 signature de signer autoriz.   ← solo signers permitidos
   ├─ nonce + deadline                       ← anti-replay/expiry
   ├─ MIN_INTERVAL = 1 hora                  ← anti-flap
   └─ caller binding (caller == msg.sender)  ← anti-relay
```

**Defensa**: 7 capas. Excelente.

### Capa 5 — Status del Totem (NFT soulbound + reputación)
```
Totem.sync
   ├─ msg.sender == user || admin            ← restricción explícita
   ├─ registry.isTotem(user)                 ← debe estar registrado
   ├─ !fraudLocked                           ← no fraudulento
   ├─ MIN_SYNC_INTERVAL = 1h                 ← anti-grinding
   ├─ MAX_FUTURE_DRIFT / MAX_STALE_TIME      ← oracle freshness
   ├─ decay temporal del score acumulado     ← anti-coast-on-laurels
   └─ penalización por eventos negativos     ← retroceso de nivel
```

**Defensa**: completa. El soulbound (no transferible) + migration con delay 24h + admin approval cierra el modelo de identidad.

### Capa 6 — Fraude / lock
```
Totem.requestFraudLock → executeFraudLock
   ├─ admin-only
   ├─ getFraudDelay(user):
   │     levelDelay  = 5min..6h según level
   │     valueDelay  = 5min..6h según price
   │     return MAX(levelDelay, valueDelay)
   └─ requiere ejecución explícita después del delay
```

**Defensa**: timelock variable según valor en juego. Bien diseñado.

### Capa 7 — Treasury (custodia de fondos)
```
TotemTreasury.withdrawETH/withdrawERC20
   ├─ onlyAuthorized (owner OR operator)
   ├─ nonReentrant
   ├─ whenNotPaused
   ├─ rate limit por asset y por periodo
   └─ pause de emergencia
```

**Defensa**: rate limit + pause + dual-role. Robusta.

### Capa 8 — Governance (cambios de contratos)
```
TotemGovernance
   ├─ createProposal: onlyOwner
   ├─ minDelay 1h..maxDelay 3d                ← timelock obligatorio
   ├─ executeProposal: público después delay  ← descentralización execución
   ├─ proposalTTL = 3d                        ← proposals caducan
   └─ emergencyMode bloquea ejecución         ← circuit breaker
```

### Capa 9 — Graduation (paso a AMM)
```
TotemGraduationManager.graduate
   ├─ minLevel = 4 (alta reputación)
   ├─ minSupply = 10,000
   ├─ minVolume = 15,000 ether (verificado)
   ├─ minAge = 45 days
   ├─ !fraudLocked
   ├─ curve.freeze(totem) atómico
   ├─ HumanTotem deployed con avatar=user
   ├─ liquidez aportada por liquidityProvider autorizado
   └─ liquidez transferida AL CREADOR (user)
```

**Defensa**: 9 condiciones acumulativas. La graduación es difícil y deliberada.

---

## A.2. Resumen Sistémico

El protocolo presenta **defensa en profundidad genuina**:
- 5 contratos colaboran para garantizar identidad (Registry → Facade → Totem → Attestation → CoreRouter).
- 4 contratos colaboran en mercado (Curve → Metrics → AntiManipulation → StabilityModule).
- 3 contratos colaboran en datos firmados (Oracle → AccessGateway → Reader).
- Los timelocks (Governance 1h–3d, Migration 24h, FraudLock 5min–6h, Control 1h, Attestation 1h–3d, Treasury rate limits) cubren la mayoría de superficies administrativas.

**Conclusión sistémica**: la arquitectura es sólida. Los hallazgos reales son específicos y se concentran en (a) un contrato incompleto, (b) un bug puntual de tipo, y (c) algunos gaps de coherencia en cómo se layeran las verificaciones de "humanidad".

---

# PARTE B — HALLAZGOS REALES

## RESUMEN

| Severidad | Cantidad | Cambio vs v2 |
|-----------|----------|--------------|
| CRÍTICO   | 2        | -5 (downgrade tras análisis sistémico) |
| ALTO      | 5        | -6 |
| MEDIO     | 6        | -2 |
| INFO      | 8        | +1 |

---

## [CRÍTICO-1] `TotemIntentRouter` — Contrato Incompleto

**Archivo**: `TotemIntentRouter.sol`

El contrato `TotemUltimateRouter` termina literalmente con:
```solidity
// ... (Firma y Withdraw functions)
```

Las funciones `_verifySignature`, `_handleExecution`, `_calculateIntentHash` y `withdraw` no están implementadas. **Bloqueo de deploy**.

**Impacto sistémico**: este es el único contrato que usa consenso de 3 oráculos vía mediana. Si se despliega con stub, el sistema entero pierde esa capa de validación. Adicionalmente, este contrato es el único que NO usa `registry.isTotem` — solo `attestation.isHuman` (ver [ALTO-2]).

**Recomendación**: completar el contrato; ejecutar tests de integración antes del deploy.

---

## [CRÍTICO-2] `TotemStabilityModule.stabilize` — Buyback Calculado sobre Balance ETH (Bug de Tipo)

**Archivo**: `TotemStabilityModule.sol` (línea 101)

```solidity
feeRouter.harvest();                              // distribuye LP tokens
uint256 available = address(feeRouter).balance;   // ← lee ETH balance (= 0)
uint256 buybackAmount = (available * rate) / 100; // = 0
feeRouter.executeBuyback(buybackAmount);          // revierte por require(amount > 0)
```

`harvest()` distribuye LP tokens (ERC-20) al treasury, buybackVault y rewardPool. Después, `address(feeRouter).balance` lee el balance ETH nativo del feeRouter (que normalmente es 0). El `executeBuyback(0)` revierte.

**Análisis sistémico**: aunque revierte (no es silencioso), el efecto neto es que la estabilización **nunca completa**. El cooldown no se actualiza, el mercado no recibe el buyback, y el `stressIndex` no se persiste. El stability module está completamente roto como mecanismo.

**Adicionalmente**: el `harvest` ya distribuye los LP tokens ANTES del cálculo del buyback. Aun si el bug se corrige, el módulo intentaría hacer buyback sobre un balance ya vaciado por el propio harvest.

**Recomendación**: 
1. Cambiar a `IERC20(lpToken).balanceOf(address(feeRouter))`.
2. Reordenar: NO llamar `harvest` antes del buyback (consume el balance disponible). En su lugar, pre-asignar una porción al buybackVault y solo entonces invocarla.

---

## [ALTO-1] `TotemFeeRouter.harvest` — Distribución Antes de Buyback Genera Race con Stability Module

**Archivo**: `TotemFeeRouter.sol` y `TotemStabilityModule.sol`

**Vector sistémico**: 
- `TotemStabilityModule.stabilize` llama `feeRouter.harvest()` → vacía el balance.
- Después intenta `executeBuyback`, pero el balance ya no está.
- `executeBuyback` es **público sin access control**, por lo que cualquier actor puede llamarlo independientemente del módulo de estabilidad.

Este NO es un robo de fondos (los LP tokens van al `buybackVault` legítimo, configurado por `setBuybackVault` del owner), pero permite a un actor consumir el balance del feeRouter en cualquier momento, descoordinando los buybacks programados.

**Recomendación**: agregar `onlyOwner` o `onlyStabilityModule` a `executeBuyback`. Alternativamente, restructurar el flujo para que harvest reserve una porción para buyback automáticamente.

---

## [ALTO-2] Inconsistencia: `TotemIntentRouter` Solo Verifica `Attestation`, No `Registry`

**Archivos**: `TotemIntentRouter.sol`, `TotemAttestation.sol`, `TotemRegistry.sol`

El sistema tiene dos fuentes de "es humano":
- `TotemRegistry.isTotem(user)` — basado en World ID + nullifier.
- `TotemAttestation.isHuman(user)` — controlado manualmente por el owner.

`TotemCoreRouter.isEligibleUser` requiere AMBOS (defense in depth correcta):
```solidity
return registry.isTotem(user) && attestation.isHuman(user);
```

Pero `TotemIntentRouter.executeIntent` **solo** verifica `attestation.isHuman(user)`. Esto significa que si el owner de Attestation marca a un usuario como humano (sin que ese usuario haya pasado por World ID), ese usuario puede ejecutar intents en el router sin tener Totem registrado.

**Riesgo sistémico**: Attestation es un mecanismo paralelo legítimo (permite onboarding manual fuera de banda), pero su uso aislado en IntentRouter rompe la coherencia del modelo. Si la clave del owner de Attestation se compromete, el atacante puede crear "humanos" arbitrarios y ejecutar intents.

**Recomendación**: `IntentRouter` debe aplicar la misma regla que `CoreRouter`: requerir `registry.isTotem(user) && attestation.isHuman(user)`.

---

## [ALTO-3] `TotemBondingCurve.sell` — `maxSellBps` se Aplica sobre Balance Pre-Venta (Recálculo Permite >45%)

**Archivo**: `TotemBondingCurve.sol` (líneas 224-232)

```solidity
SellWindow storage w = sellWindows[totem][msg.sender];
if (block.timestamp > w.lastReset + SELL_WINDOW) {
    w.sold = 0;
    w.lastReset = block.timestamp;
}
if (w.sold + tokensIn > (userBalance * maxSellBps) / 10000) {
    revert SellLimitExceeded();
}
```

`userBalance` se lee **al momento de cada llamada** (`balances[totem][msg.sender]` antes de la venta). Tras vender, el balance disminuye, pero en la siguiente venta `userBalance` es menor → el ratio `(userBalance * 4500)/10000` también es menor.

**Sin embargo**, `w.sold` acumula, así que el límite efectivo no es exactamente 45% del balance original. Ejemplo:
- Balance inicial: 1000 tokens. Límite: 450 tokens.
- Venta 1: 450 tokens (al límite). Balance restante: 550. `w.sold = 450`.
- Venta 2: nuevo límite = `550 * 0.45 = 247.5`. Pero `w.sold + tokensIn = 450 + 1 = 451 > 247.5` → revierte.

Análisis: el chequeo siempre se compara contra el balance ACTUAL × 45%, mientras `w.sold` acumula desde el inicio. Esto hace el límite **más restrictivo** con el tiempo, no menos. **Mi crítica anterior era incorrecta**: el sistema funciona como anti-dump razonable.

**El gap real**: el límite se aplica por wallet, no por totem. Un actor con N wallets puede vender N × ~45% del supply combinado. Esta es una limitación de diseño aceptable (el trading es libre), pero el efecto anti-dump declarado solo aplica a un único actor con una wallet, no a un actor coordinado.

**Recomendación**: Documentar explícitamente que `maxSellBps` protege solo contra dumps de single-wallet, no contra dumps coordinados. Considerar agregar un límite por totem (`maxSellBps` aplicado al supply total por ventana).

---

## [ALTO-4] `TotemRegistry.executeMigration` — No Verifica `isBlocked[newUser]`

**Archivo**: `TotemRegistry.sol`

`requestMigration` verifica `isBlocked[oldUser]` pero no `isBlocked[newUser]`. Si admin bloquea `newUser` durante el delay de 24h, `executeMigration` lo ignora.

**Mitigación sistémica existente**: `isTotem(user)` retorna `hasTotem[user] && !isBlocked[user]`. Por lo tanto, un `newUser` bloqueado que recibe un Totem migrado no podrá operar (queda como zombie). El admin puede `unblockTotem` después.

**Riesgo real**: el `oldUser` pierde permanentemente su Totem (se borra `hasTotem[oldUser]`) sin que el `newUser` pueda usarlo. Es un bricking del Totem hasta que el admin desbloquee.

**Recomendación**: agregar `if (isBlocked[newUser]) revert BlockedUserCannotReceive();` en `executeMigration` para evitar el estado inconsistente.

---

## [ALTO-5] `HumanTotem._transfer` — Stale Score Bloquea Transferencias Post-Graduación

**Archivo**: `HumanTotem.sol` (línea 122-127)

`MAX_SCORE_STALENESS = 10 minutes`. Si el oracle no se actualiza cada 10 min, todas las transferencias del HumanTotem revierten con `StaleScore`. Después de la graduación, esto bloquea el AMM.

**Mitigación sistémica existente**: el oracle puede ser actualizado por cualquier signer autorizado pagando 0.01 ETH. Si hay incentivo económico (par de liquidez activo), un keeper puede mantenerlo actualizado.

**Riesgo real**: token graduado con bajo volumen → no hay incentivo para keeper → oracle se vuelve stale → AMM congelado. Vector de DoS pasivo.

**Recomendación**: aumentar `MAX_SCORE_STALENESS` a 1-6 horas; o implementar un fallback que use el último score conocido si no hay actualización reciente, en lugar de revertir.

---

# PARTE C — HALLAZGOS MEDIOS

## [MEDIO-1] `TotemGraduationManager._createAMM` — `addLiquidity` con `minA=0, minB=0`

```solidity
IUniswapV2Router(router).addLiquidity(token, wldToken, amountTokenWei, amountWLD, 0, 0, user, block.timestamp);
```

**Contexto sistémico**: el pair se crea **en la misma transacción** (`createPair` antes de `addLiquidity`). Como el pair acaba de nacer, no hay liquidez previa y `minA/minB` son irrelevantes para la primera adición (el ratio es definido por la propia adición). La **primera** liquidez establece el precio.

**Riesgo real**: si alguien front-runea el `graduate()` con una `addLiquidity` independiente al pair recién creado, podrían inflar/deflar el precio inicial. Pero esto requiere observar la transacción de `graduate` y meterse antes — y el pair se crea en la misma tx, lo que lo hace difícil pero no imposible (los searchers pueden interceptar usando MEV).

**Recomendación**: Verificar tras `addLiquidity` que el balance recibido por `user` cumple `>= 0.99 * amount` o usar el patrón de `quote()` para precios esperados. La criticidad real es menor de lo que indiqué en v2.

---

## [MEDIO-2] `TotemBondingCurve` — Métricas Inconsistentes Buy vs Sell

`recordBuy(totem, amountWldIn)` registra el monto bruto pagado (incluye fee). `recordSell(totem, payout)` registra el monto neto recibido (excluye fee). Volumen acumulado infla compras vs ventas.

**Impacto**: distorsiona el `verifiedVolume` y por extensión la elegibilidad para graduación (que requiere `minVolume = 15,000 ether`).

---

## [MEDIO-3] `TotemMarketMetrics.verifyVolume` — Sin Cota Superior

El signer puede establecer `verifiedVolume` arbitrariamente alto. Mitigación sistémica: requiere firma EIP-712 de un signer autorizado, y existe un backup signer. Si la clave se compromete, todos los Totems pueden ser graduados artificialmente.

**Recomendación**: limitar `verifiedVolume <= K * rawVolume` (por ejemplo K=2). El signer solo refrenda volumen ya generado on-chain.

---

## [MEDIO-4] `TotemControl.emergencySetFee` — Bypass del Timelock con Limit del 20%

Pertinente solo si el owner es comprometido. La protección `MAX_CHANGE_BPS = 20%` limita el cambio máximo. Riesgo acotado.

---

## [MEDIO-5] `TotemFactory._deploy` — Sin Verificación `code.length`

Después de `CREATE`, no se valida `addr.code.length > 0`. En casos extremos (constructor con OOG silencioso), podría devolver dirección no-cero sin código. Mitigación: la transacción completa fallaría más adelante al intentar usar el contrato.

---

## [MEDIO-6] `TotemAccessGateway.query` — Acumulación de ETH Sin Distribución Automática

El contrato acumula ETH de queries. Solo el owner puede `withdraw`. No hay ruta automática hacia treasury o fee router. Riesgo: dependencia operacional del owner para desplazar fondos periódicamente.

---

# PARTE D — HALLAZGOS INFORMATIVOS

## [INFO-1] `TotemRegistry` Define Localmente `IWorldIDVerifier`
Existe `ITotemInterfaces.IWorldIDVerifier` (idéntica), pero `TotemRegistry` redefine localmente. Posible divergencia futura.

## [INFO-2] `Totem.sol` y `TotemBondingCurve.sol` Usan Interfaces Locales
Mismo problema que INFO-1 con `IRegistry`, `IOracle`, `IBondingCurve`, `IMetrics`.

## [INFO-3] `TotemBondingCurve._solveBuyEff` — Edge Case Trivial
La búsqueda binaria de respaldo con `while V(high) < target → high *= 2` garantiza convergencia. **Mi hallazgo de v2 (CRÍTICO-6) era incorrecto**. El usuario está protegido por `if (tokensOut < minTokensOut)` siempre que pase `minTokensOut > 0`. Solo usuarios que pasen `minTokensOut = 0` quedan sin protección de slippage.

## [INFO-4] `TotemRegistry.requestMigration` — Consentimiento Validado por Admin

El admin valida criptográficamente que el `newNullifierHash` corresponde a la misma identidad humana que el `oldNullifierHash` (verificación contra el `nullifierHash` de World ID, determinístico). Eve no puede falsificar el nullifier de Alice. La aprobación es criptográficamente verificable, no basada en confianza.

**Recomendación**: documentar el procedimiento en el runbook operacional. Considerar agregar `event MigrationVisible(oldUser, newUser, executeAfter)` para que `oldUser` pueda disputar antes del execute (aunque la verificación cripto del admin ya cierra el ataque).

## [INFO-5] `TotemRegistry.GROUP_ID = 1` Hardcoded a Orb
Es la elección correcta (Orb verification = mayor seguridad). Solo informativo: documentar la elección y el procedimiento si World ID despliega un nuevo group ID.

## [INFO-6] `TotemScoreLib` Es Dead Code
Definida pero no importada en ningún contrato de producción. `HumanTotem` usa constantes hardcodeadas. Eliminar o utilizar consistentemente.

## [INFO-7] `TotemAntiManipulationLayer` No Está Conectado al Sistema
El contrato existe (EMA del precio) pero ningún otro contrato lo invoca. Es código no integrado.

## [INFO-8] `TotemReader` — Sin Mutabilidad de Direcciones
Las direcciones de oracle y registry son inmutables tras deploy. Si se actualizan, el reader queda desincronizado. Aceptable para un componente de solo lectura, pero documentar.

---

# PARTE E — VECTORES DE ATAQUE VERIFICADOS CONTRA EL CONJUNTO

## E.1. Vectores Refutados por el Análisis Sistémico

| Vector planteado en v2 | Por qué NO es viable |
|------------------------|----------------------|
| Robo de identidad por migración | Admin valida criptográficamente el nullifier — Eve no puede generar el nullifier de Alice |
| Bypass de humanidad en mercados | Por diseño el trading es libre; `isTotem(totem)` protege que solo Totems registrados sean tradeados |
| Sandwich en graduación | El pair se crea atómicamente; el ataque requeriría MEV avanzado y el creador recibe la liquidez |
| Drenaje vía `executeBuyback` | El buybackVault es controlado por owner; cualquiera puede mover fondos al vault legítimo |
| Censura por admin | Multi-step: requiere comprometer owner del Registry; mitigado parcialmente por flujo público de `unblockTotem` |

## E.2. Vectores Reales Confirmados

### Vector 1: Bypass de Verificación Humana Vía IntentRouter
```
Pre-condición: clave del owner de Attestation comprometida
              (NO requiere comprometer Registry ni World ID).

1. Atacante llama TotemAttestation.scheduleVerification(eve, true, 1h)
   → tras 1h, executeScheduled(eve) marca isHuman[eve] = true
2. Eve llama TotemIntentRouter.executeIntent(eve, ...)
3. attestation.isHuman(eve) = true ✓ (única verificación de humanidad)
4. registry.isTotem(eve) NO se verifica
5. Intent ejecutado sin pasar por World ID

Mitigación: aplicar misma regla que CoreRouter en IntentRouter.
```

### Vector 2: Stability Module Inoperante
```
1. Mercado entra en stress (precio cae 40%, volumen 50%)
2. Cualquiera llama stabilize(totem)
3. harvest() distribuye LP tokens al buybackVault, treasury, rewardPool
4. address(feeRouter).balance = 0 (es ETH, no LP)
5. executeBuyback(0) revierte
6. lastStabilization NO se actualiza
7. Bucle infinito posible — atacante puede forzar reverts repetidos sin progreso

Impacto: el mecanismo defensivo del protocolo está roto.
Mitigación: corrección de tipo + reordenamiento de harvest/buyback.
```

### Vector 3: DoS de Token Graduado vía Oracle Stale
```
1. Token graduado tiene bajo volumen → no hay keeper actualizando oracle
2. Oracle pasa 10 min sin update
3. HumanTotem._transfer revierte siempre con StaleScore
4. AMM completamente bloqueado para ese token
5. Holders no pueden vender; LP queda atrapado

Mitigación: aumentar MAX_SCORE_STALENESS o agregar fallback al último score.
```

### Vector 4: Bricking de Totem por Migración + Block
```
1. oldUser solicita migración legítima a newUser
2. Admin aprueba (validación criptográfica OK)
3. Durante delay 24h, admin bloquea newUser por otra razón (compliance)
4. Cualquiera ejecuta executeMigration → hasTotem[newUser]=true pero
   isTotem(newUser)=false (porque está blocked)
5. oldUser ya perdió hasTotem; newUser no puede usar el Totem
6. Estado zombie hasta que admin haga unblockTotem(newUser)

Impacto: Totem bricked temporalmente.
Mitigación: check isBlocked[newUser] en executeMigration.
```

---

# PARTE F — RECOMENDACIONES PRIORITARIAS

| ID | Severidad | Acción |
|----|-----------|--------|
| CRÍTICO-1 | CRÍTICO | Implementar TotemIntentRouter completo antes de deploy |
| CRÍTICO-2 | CRÍTICO | Fix `address(feeRouter).balance` → `IERC20(lpToken).balanceOf(...)` y reordenar harvest/buyback |
| ALTO-1 | ALTO | `onlyOwner` (o `onlyStabilityModule`) en `executeBuyback` |
| ALTO-2 | ALTO | `IntentRouter` debe verificar `registry.isTotem` además de `attestation.isHuman` |
| ALTO-3 | ALTO | Documentar que `maxSellBps` protege solo single-wallet; añadir límite por totem si se requiere anti-dump global |
| ALTO-4 | ALTO | Check `isBlocked[newUser]` en `executeMigration` |
| ALTO-5 | ALTO | Aumentar `MAX_SCORE_STALENESS` a 1-6h o agregar fallback |
| MEDIO-1..6 | MEDIO | Aplicar correcciones documentadas |
| INFO | INFO | Unificar interfaces, conectar AntiManipulationLayer o remover, documentar |

---

# CONCLUSIÓN

El protocolo Totem presenta una **arquitectura sólida con defensa en profundidad genuina**. Los 24 contratos cooperan adecuadamente para garantizar:
- Identidad humana mediante World ID (creación) + admin block list (revocación) + nullifier permanente.
- Trading libre post-creación (por diseño) con protecciones de posición individual y anti-dump por wallet.
- Múltiples capas de timelock para acciones administrativas (1h–3d en Governance, 24h en Migration, 5min–6h en Fraud, etc.).
- Validaciones cruzadas en queries (Registry + Attestation + RateLimiter + EIP-712 firmas + freshness).

**Hallazgos críticos reales: 2** (no 8 como en v2):
1. `TotemIntentRouter` está incompleto — bloquea deploy.
2. `TotemStabilityModule` tiene un bug de tipo que lo hace inoperante.

**Hallazgos altos reales: 5**, principalmente coherencia del modelo (IntentRouter vs CoreRouter usan reglas distintas), control de acceso de buyback, edge case de migración + block, y staleness del oracle post-graduación.

**No son vulnerabilidades** (refutados por análisis sistémico):
- Robo de identidad por migración (admin valida cripto).
- Bypass de Sybil en mercados (trading libre por diseño es correcto).
- Sandwich en graduación (atomicidad de createPair+addLiquidity).
- Drenaje vía executeBuyback (vault es del protocolo).

La versión 2 del informe sobre-estimaba la severidad por analizar contratos aisladamente. Esta versión 3, basada en el análisis del conjunto, refleja con mayor precisión el estado de seguridad del sistema.

---
*Auditoría sistémica de los 24 contratos. Análisis estático + modelo de seguridad por capas.*

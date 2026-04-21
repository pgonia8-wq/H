/**
 * stability.mjs — Mirror BigInt EXACTO de TotemStabilityModule.sol
 *
 * RESPONSABILIDAD ÚNICA:
 *   Replicar las fórmulas pure-view del módulo de estabilidad del contrato:
 *     - calculateStress (priceDrop + volumeDrop + repRisk) / 3
 *     - getBuybackRate (piecewise 40 / linear / 85)
 *     - canStabilize (cooldown 6h)
 *
 * REGLAS:
 *   - NO inventa estados nuevos (no "normal/warning/critical"): solo lo que
 *     el contrato declara. Cualquier label semántico extra debe vivir en el
 *     UI, no aquí.
 *   - NO clampea el branch lineal a maxBuybackRate (mirror literal del bug
 *     no-monotónico del contrato — ver ONCHAIN_PIECEWISE_NONMONOTONIC abajo).
 *   - NO calcula buyback amount en WLD (el contrato lo deriva de
 *     `address(feeRouter).balance`, que solo el on-chain conoce).
 *   - Todo BigInt para preservar la semántica uint256 del contrato.
 *
 * INPUTS (lo que el contrato lee de `lastPrice`, `lastVolume`, `lastStabilization`)
 * vienen como argumentos explícitos: este módulo es pure, sin estado.
 *
 * ⚠ DEGENERATE BRANCH (intentional contract design)
 * ──────────────────────────────────────────────────
 * `repRisk = avgReputation < 800 ? 30 : 10`
 * Como TotemOracle nunca emite scores < 975 (revert InvalidRange en update),
 * el branch `repRisk = 30` es estadísticamente inalcanzable en producción.
 * En la práctica: `repRisk` es SIEMPRE 10. Mantenemos el branch porque es
 * mirror literal del contrato y un futuro hardfork podría modificar Oracle.
 *
 * ⚠ ONCHAIN_PIECEWISE_NONMONOTONIC (intentional mirror)
 * ─────────────────────────────────────────────────────
 * En el rango stress ∈ [43, 49] el branch lineal `40 + (stress-20)*2` produce
 * valores 86..98 que SUPERAN `maxBuybackRate` (85). El contrato NO clampea
 * antes de retornar, por lo que `getBuybackRate(48) = 96 > getBuybackRate(50) = 85`.
 * Mirror literal mantiene esa no-monotonía. ONCHAIN WINS ALWAYS.
 */

import { Stability as S } from "./protocolConstants.mjs";

// ════════════════════════════════════════════════════════════════════════════
// PRIMITIVAS PURE — espejo exacto del contrato
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calcula priceDrop como porcentaje uint256 (0-100).
 * Mirror literal: `lastPrice > currentPrice ? ((lastPrice - currentPrice) * 100) / lastPrice : 0`
 *
 * División integer truncada (igual que Solidity).
 *
 * @param {bigint} lastPrice
 * @param {bigint} currentPrice
 * @returns {bigint} drop ∈ [0, 100]
 */
export function priceDropBps100(lastPrice, currentPrice) {
  if (typeof lastPrice !== "bigint" || typeof currentPrice !== "bigint") {
    throw new TypeError("priceDropBps100: lastPrice/currentPrice must be bigint");
  }
  if (lastPrice <= currentPrice) return 0n;
  return ((lastPrice - currentPrice) * 100n) / lastPrice;
}

/**
 * Calcula volumeDrop como porcentaje uint256 (0-100). Misma fórmula que price.
 */
export function volumeDropBps100(lastVolume, currentVolume) {
  if (typeof lastVolume !== "bigint" || typeof currentVolume !== "bigint") {
    throw new TypeError("volumeDropBps100: lastVolume/currentVolume must be bigint");
  }
  if (lastVolume <= currentVolume) return 0n;
  return ((lastVolume - currentVolume) * 100n) / lastVolume;
}

/**
 * repRisk según contrato. Ver DEGENERATE BRANCH arriba.
 */
export function repRisk(avgReputation) {
  if (typeof avgReputation !== "bigint") {
    throw new TypeError("repRisk: avgReputation must be bigint");
  }
  return avgReputation < S.REP_RISK_THRESHOLD ? S.REP_RISK_HIGH : S.REP_RISK_LOW;
}

/**
 * calculateStress mirror exacto:
 *   stress = (priceDrop + volumeDrop + repRisk) / 3
 *   if (stress > 100) stress = 100
 *
 * @param {object} p
 * @param {bigint} p.lastPrice         - último precio guardado on-chain
 * @param {bigint} p.currentPrice      - precio actual desde curve
 * @param {bigint} p.lastVolume        - último volumen guardado on-chain
 * @param {bigint} p.currentVolume     - volumen actual desde metrics
 * @param {bigint} p.avgReputation     - score promedio (Oracle scale)
 * @returns {bigint} stressIndex ∈ [0, 100]
 */
export function calculateStress({ lastPrice, currentPrice, lastVolume, currentVolume, avgReputation }) {
  const pd = priceDropBps100(lastPrice, currentPrice);
  const vd = volumeDropBps100(lastVolume, currentVolume);
  const rr = repRisk(avgReputation);

  let stress = (pd + vd + rr) / 3n;
  if (stress > S.STRESS_MAX) stress = S.STRESS_MAX;
  return stress;
}

/**
 * getBuybackRate mirror exacto (con NO clamp en branch lineal — ver header).
 *
 *   stress < 20  → baseBuybackRate (40)
 *   stress < 50  → baseBuybackRate + (stress - 20) * 2
 *   stress >= 50 → maxBuybackRate (85)
 *
 * @param {bigint} stress
 * @returns {bigint} rate (uint256)
 */
export function getBuybackRate(stress) {
  if (typeof stress !== "bigint") {
    throw new TypeError("getBuybackRate: stress must be bigint");
  }
  if (stress < S.STRESS_PIECEWISE_LOW)  return S.BASE_BUYBACK_RATE;
  if (stress < S.STRESS_PIECEWISE_HIGH) return S.BASE_BUYBACK_RATE + (stress - S.STRESS_PIECEWISE_LOW) * 2n;
  return S.MAX_BUYBACK_RATE;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS DE CONSULTA — derivados pure, NO estado del contrato
// ════════════════════════════════════════════════════════════════════════════

/**
 * Tiempo restante hasta poder llamar stabilize() de nuevo.
 * Contrato: `block.timestamp > lastStabilization + cooldown` (estricto >).
 *
 * @param {object} p
 * @param {bigint} p.lastStabilization - timestamp del último stabilize() (0 si nunca)
 * @param {bigint} p.now               - block.timestamp (unix seconds)
 * @returns {bigint} segundos restantes (0 si ya se puede)
 */
export function secondsUntilStabilize({ lastStabilization, now }) {
  if (typeof lastStabilization !== "bigint" || typeof now !== "bigint") {
    throw new TypeError("secondsUntilStabilize: bigint required");
  }
  const unlockAt = lastStabilization + S.COOLDOWN_SEC;
  if (now > unlockAt) return 0n;
  // wait = unlockAt - now + 1 (necesita ESTRICTO >, no ≥)
  return unlockAt - now + 1n;
}

export function canStabilize({ lastStabilization, now }) {
  return secondsUntilStabilize({ lastStabilization, now }) === 0n;
}

/**
 * Preview completo del estado de stability para un totem (off-chain mirror).
 * NO incluye buyback amount en WLD (eso requiere balance del feeRouter on-chain).
 *
 * @param {object} p — todos los inputs explícitos, sin estado oculto
 * @returns {{stress: bigint, buybackRate: bigint, canStabilize: boolean, secondsUntilUnlock: bigint}}
 */
export function stabilizationPreview({
  lastPrice, currentPrice,
  lastVolume, currentVolume,
  avgReputation,
  lastStabilization, now,
}) {
  const stress = calculateStress({ lastPrice, currentPrice, lastVolume, currentVolume, avgReputation });
  const rate   = getBuybackRate(stress);
  const wait   = secondsUntilStabilize({ lastStabilization, now });
  return {
    stress,
    buybackRate: rate,
    canStabilize: wait === 0n,
    secondsUntilUnlock: wait,
  };
}

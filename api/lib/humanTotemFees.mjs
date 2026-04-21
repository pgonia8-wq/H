/**
 * humanTotemFees.mjs — Mirror BigInt EXACTO de HumanTotem.sol (C8)
 *
 * SOLE SOURCE OF TRUTH: tótem/contracts/HumanTotem.sol
 *
 * Reglas reflejadas (NO inventar, NO simplificar):
 *   - SCORE_THRESHOLD_LOW       = 4000  → fee 10% (1000 bps) si score < 4000
 *   - SCORE_THRESHOLD_CRITICAL  = 2000  → fee 20% (2000 bps) si score < 2000
 *   - MAX_SCORE_STALENESS       = 10 min → revert StaleScore
 *   - fraudLocked               = true  → revert HumanFraudDetected
 *   - from == owner()           → exento (AMM safe), fee = 0
 *   - fee = (amount * feeBps) / 10_000
 *   - finalAmount = amount - fee  (solo si fee > 0; si fee == 0 no hay split)
 *
 * baseFeeBps default = 0 (mutable on-chain por owner). El mirror lo trata
 * como input opcional (si no se pasa → 0), reflejando default de constructor.
 */

export const SCORE_THRESHOLD_LOW = 4000n;
export const SCORE_THRESHOLD_CRITICAL = 2000n;

export const FEE_BPS_CRITICAL = 2000n;   // 20%
export const FEE_BPS_LOW = 1000n;        // 10%
export const FEE_BPS_DENOMINATOR = 10_000n;

export const MAX_SCORE_STALENESS_SEC = 600n;  // 10 minutes

/**
 * Mirror de HumanTotem._calculateDynamicFee(uint256 score).
 * Devuelve fee en BPS según rangos. baseFeeBps default = 0n.
 */
export function calculateDynamicFeeBps(score, { baseFeeBps = 0n } = {}) {
  const s = BigInt(score);
  if (s < SCORE_THRESHOLD_CRITICAL) return FEE_BPS_CRITICAL;
  if (s < SCORE_THRESHOLD_LOW)      return FEE_BPS_LOW;
  return BigInt(baseFeeBps);
}

/**
 * Mirror de HumanTotem._transfer(from, to, amount). Devuelve qué pasaría:
 *   { ok: false, reason: "HumanFraudDetected" | "StaleScore" }
 *   { ok: true, feeBps, fee, net, treasury, exempted }
 *
 * Inputs:
 *   amount         BigInt-coercible: cantidad a transferir
 *   score          BigInt-coercible: score actual del avatar
 *   fromOwner      bool: true si from === owner() (exento)
 *   locked         bool: true si registry.status(avatar).fraudLocked
 *   scoreAgeSec    BigInt-coercible: edad del score on-chain (block.timestamp - oracle.ts).
 *                  Si oracle.ts == 0 (sin score), pasar 0n y locked=false → no revert.
 *   baseFeeBps     BigInt-coercible: opcional, default 0n.
 */
export function previewTransfer({
  amount,
  score,
  fromOwner = false,
  locked = false,
  scoreAgeSec = 0n,
  oracleHasScore = true,
  baseFeeBps = 0n,
}) {
  const a = BigInt(amount);
  const age = BigInt(scoreAgeSec);

  if (locked) {
    return { ok: false, reason: "HumanFraudDetected" };
  }
  // Mirror: `if (ts > 0 && block.timestamp - ts > MAX_SCORE_STALENESS) revert`
  if (oracleHasScore && age > MAX_SCORE_STALENESS_SEC) {
    return { ok: false, reason: "StaleScore", maxStalenessSec: MAX_SCORE_STALENESS_SEC };
  }

  // Owner exempted (AMM safe)
  if (fromOwner) {
    return {
      ok: true,
      exempted: true,
      feeBps: 0n,
      fee: 0n,
      net: a,
      treasury: 0n,
    };
  }

  const feeBps = calculateDynamicFeeBps(score, { baseFeeBps });

  // Mirror exacto: si feeBps == 0 → no fee, finalAmount = amount.
  if (feeBps === 0n) {
    return { ok: true, exempted: false, feeBps: 0n, fee: 0n, net: a, treasury: 0n };
  }

  const fee = (a * feeBps) / FEE_BPS_DENOMINATOR;

  // Mirror: si fee == 0 (amount muy chico vs feeBps), no se hace split.
  if (fee === 0n) {
    return { ok: true, exempted: false, feeBps, fee: 0n, net: a, treasury: 0n };
  }

  const net = a - fee;
  return { ok: true, exempted: false, feeBps, fee, net, treasury: fee };
}

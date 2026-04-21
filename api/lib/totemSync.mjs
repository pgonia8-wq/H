/**
 * totemSync.mjs — Mirror BigInt EXACTO de Tótem.sol (C9)
 *
 * SOLE SOURCE OF TRUTH: tótem/contracts/Tótem.sol
 *
 * Reflejado:
 *   - calculateLevel(total)           → 1..5 según thresholds (10K, 100K, 500K, 1M)
 *   - calculateBadge(score, neg)      → 0..3 según neg / score
 *   - DECAY                           → (total * (now - lastUpdate)) / 1 day / 100
 *   - PENALTY                         → (lastScore - score) / 3, capped at total/2
 *   - MAX_ACCUMULATED_SCORE           → 10_000_000 clamp
 *   - MIN_SYNC_INTERVAL               → 1 hour
 *   - MAX_FUTURE_DRIFT / MAX_STALE    → ±5min / 10min
 *   - getFraudDelay(level, price)     → max(levelDelay, valueDelay), o manualFraudDelay si > 0
 *
 * Diferencias respecto al contrato:
 *   - El contrato persiste history. Aquí recibimos history como input puro y
 *     devolvemos el next-state. NO mutamos. NO consultamos chain.
 *   - El contrato hace `revert` con custom errors. Aquí devolvemos { ok:false, reason }.
 */

export const MIN_SYNC_INTERVAL_SEC  = 3600n;        // 1 hour
export const MAX_ACCUMULATED_SCORE  = 10_000_000n;
export const MAX_FUTURE_DRIFT_SEC   = 300n;         // 5 minutes
export const MAX_STALE_TIME_SEC     = 600n;         // 10 minutes
export const ONE_DAY_SEC            = 86_400n;
export const NEGATIVE_BADGE_THRESHOLD = 50n;

// ═════════════════════════════════════════════════════════════════════
// LEVEL / BADGE — funciones puras espejo
// ═════════════════════════════════════════════════════════════════════

export function calculateLevel(totalAccumulated) {
  const t = BigInt(totalAccumulated);
  if (t > 1_000_000n) return 5n;
  if (t > 500_000n)   return 4n;
  if (t > 100_000n)   return 3n;
  if (t > 10_000n)    return 2n;
  return 1n;
}

export function calculateBadge(score, negativeEvents) {
  const s = BigInt(score);
  const n = BigInt(negativeEvents);
  if (n > NEGATIVE_BADGE_THRESHOLD) return 0n;
  if (s > 8000n) return 3n;
  if (s > 5000n) return 2n;
  return 1n;
}

// ═════════════════════════════════════════════════════════════════════
// DECAY / PENALTY — math individual
// ═════════════════════════════════════════════════════════════════════

/**
 * Mirror exacto de la rama DECAY en Tótem.sync():
 *   decay = (total * (now - lastUpdate)) / 1 days / 100
 *   total -= decay (clamp a 0)
 */
export function applyDecay({ totalAccumulated, nowSec, lastUpdateSec }) {
  const t = BigInt(totalAccumulated);
  if (t === 0n) return 0n;
  const dt = BigInt(nowSec) - BigInt(lastUpdateSec);
  if (dt <= 0n) return t;
  const decay = (t * dt) / ONE_DAY_SEC / 100n;
  return decay >= t ? 0n : t - decay;
}

/**
 * Mirror de la rama PENALTY (score < lastScore):
 *   penalty = (lastScore - score) / 3
 *   capped at totalAccumulated / 2
 */
export function calculatePenalty({ lastScore, currentScore, totalAccumulated }) {
  const last = BigInt(lastScore);
  const cur  = BigInt(currentScore);
  const total = BigInt(totalAccumulated);
  if (cur >= last) return 0n;
  const raw = (last - cur) / 3n;
  const max = total / 2n;
  return raw > max ? max : raw;
}

// ═════════════════════════════════════════════════════════════════════
// PREVIEW SYNC — full mirror de Tótem.sync(user)
// ═════════════════════════════════════════════════════════════════════

/**
 * Devuelve qué pasaría si se llamara sync() ahora con (newScore, newInfluence, newTimestampSec).
 *
 * history = {
 *   totalScoreAccumulated: BigInt-coercible,
 *   lastScore: BigInt-coercible,
 *   lastInfluence: BigInt-coercible,
 *   lastUpdate: BigInt-coercible,
 *   negativeEvents: BigInt-coercible,
 *   initialized: bool,
 * }
 *
 * Resultado:
 *   { ok: false, reason: "InvalidTimestamp" | "SyncTooFrequent", detail? }
 *   { ok: true,  init: bool, newHistory, level, badge, scoreAccumulatedDelta }
 */
export function previewSync({ history, newScore, newInfluence, newTimestampSec, nowSec }) {
  const score = BigInt(newScore);
  const influence = BigInt(newInfluence);
  const ts = BigInt(newTimestampSec);
  const now = BigInt(nowSec);

  // Mirror Tótem.sync: validación de timestamp del oracle.
  if (ts > now + MAX_FUTURE_DRIFT_SEC) {
    return { ok: false, reason: "InvalidTimestamp", detail: "future_drift" };
  }
  if (now > ts && now - ts > MAX_STALE_TIME_SEC) {
    return { ok: false, reason: "InvalidTimestamp", detail: "stale" };
  }

  // INIT FIX path
  if (!history?.initialized) {
    const level = calculateLevel(0n);
    const badge = calculateBadge(score, 0n);
    return {
      ok: true,
      init: true,
      newHistory: {
        totalScoreAccumulated: 0n,
        lastScore: score,
        lastInfluence: influence,
        lastUpdate: ts,
        negativeEvents: 0n,
        initialized: true,
      },
      level,
      badge,
      scoreAccumulatedDelta: 0n,
    };
  }

  const lastScore = BigInt(history.lastScore);
  const lastUpdate = BigInt(history.lastUpdate);

  if (now < lastUpdate + MIN_SYNC_INTERVAL_SEC) {
    return { ok: false, reason: "SyncTooFrequent" };
  }
  if (ts <= lastUpdate) {
    return { ok: false, reason: "InvalidTimestamp", detail: "ts_not_increasing" };
  }

  // 1. DECAY
  const totalAfterDecay = applyDecay({
    totalAccumulated: history.totalScoreAccumulated,
    nowSec: now,
    lastUpdateSec: lastUpdate,
  });

  let total = totalAfterDecay;
  let negativeEvents = BigInt(history.negativeEvents);

  // 2. DELTA
  if (score > lastScore) {
    total += score - lastScore;
  } else if (score < lastScore) {
    negativeEvents += 1n;
    const penalty = calculatePenalty({
      lastScore,
      currentScore: score,
      totalAccumulated: total,
    });
    total = penalty >= total ? 0n : total - penalty;
  }

  // 3. CLAMP
  if (total > MAX_ACCUMULATED_SCORE) {
    total = MAX_ACCUMULATED_SCORE;
  }

  const level = calculateLevel(total);
  const badge = calculateBadge(score, negativeEvents);

  return {
    ok: true,
    init: false,
    newHistory: {
      totalScoreAccumulated: total,
      lastScore: score,
      lastInfluence: influence,
      lastUpdate: ts,
      negativeEvents,
      initialized: true,
    },
    level,
    badge,
    scoreAccumulatedDelta: total - BigInt(history.totalScoreAccumulated),
  };
}

// ═════════════════════════════════════════════════════════════════════
// FRAUD DELAY — mirror de Tótem.getFraudDelay(user)
// ═════════════════════════════════════════════════════════════════════

const ONE_ETH_WEI = 10n ** 18n;
const ZERO_POINT_ONE_ETH_WEI = 10n ** 17n;

/**
 * Devuelve delay en segundos antes de que un fraud lock pueda ejecutarse.
 *
 * Inputs:
 *   level             1..5 (Status.level)
 *   priceWei          curve.getPrice(user) en wei. 0n si curve no disponible.
 *   manualFraudDelay  Si != 0, retorna ese valor (override admin).
 */
export function getFraudDelay({ level, priceWei = 0n, manualFraudDelay = 0n }) {
  const m = BigInt(manualFraudDelay);
  if (m !== 0n) return m;

  const lvl = BigInt(level);
  let levelDelay;
  if (lvl >= 5n)      levelDelay = 6n * 3600n;
  else if (lvl >= 4n) levelDelay = 3n * 3600n;
  else if (lvl >= 3n) levelDelay = 1n * 3600n;
  else                 levelDelay = 5n * 60n;

  const p = BigInt(priceWei);
  let valueDelay;
  if (p >= ONE_ETH_WEI)             valueDelay = 6n * 3600n;
  else if (p >= ZERO_POINT_ONE_ETH_WEI) valueDelay = 1n * 3600n;
  else                              valueDelay = 5n * 60n;

  return levelDelay > valueDelay ? levelDelay : valueDelay;
}

/**
 * curve.mjs — Mirror exacto de TotemBondingCurve.sol
 *
 * Esta es la ÚNICA fuente off-chain válida para precios y previews.
 * Toda la matemática es BigInt y replica literalmente las funciones del contrato:
 *   V(s), dV(s), _safeScore(s), _effective(real, score), _solveBuyEff(s0, wldIn)
 *   buy(...), sell(...) — flujo completo, mismas constantes, mismo orden de operaciones.
 *
 * Reglas:
 *   - NO inventar constantes ni redondeos.
 *   - NO simplificar la curva (cubic + linear, score-effective supply, sell-window).
 *   - NO calcular economía nueva: este módulo SOLO refleja lo que el contrato hará.
 *   - Si el contrato cambia, este archivo cambia primero — frontend nunca.
 *
 * APIs canonical (BigInt, mirror estricto):
 *   - solveBuyExact({ realSupply, scoreRaw, wldIn })            -> { tokensOut, fee, netWld, newRealSupply, s0Eff, s1Eff }
 *   - solveSellExact({ realSupply, scoreRaw, userBalance,
 *                      soldInWindow, lastReset, tokensIn, now,
 *                      maxSellBps? })                            -> { wldOut, fee, baseValue, newRealSupply, newSoldInWindow, newLastReset, deltaEff }
 *   - checkPositionLimit({ isOwner, userBalanceAfter, supplyAfter })  -> void (throws MaxPositionExceeded)
 *   - spotPriceWei({ realSupply, scoreRaw })                    -> BigInt (dV(s0Eff))
 *   - V(s), dV(s), safeScore(s), effective(real, score)         -> primitivos BigInt expuestos para tests/diagnóstico
 *
 * Wrappers compatibility (NÚMERO float, deprecados — se eliminan en Fase 7-8):
 *   - solveBuy(wldInHuman, supplyHuman, opts?)
 *   - previewSell(tokensInHuman, supplyHuman, opts?)
 *   - spotPrice(supplyHuman, opts?)
 *
 * [assumed-unit] El contrato NO declara decimales para realSupply.
 *   Análisis dimensional de V(s) con INITIAL_PRICE_WLD=5.5e8 wei y SCALE=1e20
 *   muestra que la curva es coherente cuando `s` está en UNIDADES ENTERAS de
 *   tokens (no token-wei): el término cúbico se activa cuando s²≥1e20 (s≥~1e10
 *   tokens), y el lineal da 5.5e8 wld-wei/token = 5.5e-10 WLD por token al
 *   inicio. Convención asumida del contrato:
 *     - realSupply: enteros (1 token = 1 unit)
 *     - balances:   enteros (mismas unidades)
 *     - wldIn/Out:  WLD-wei (18 decimales, ERC20 estándar)
 *   Validar al deploy con vectores reales vía assertSolidityParity().
 */

// ════════════════════════════════════════════════════════════════════════════
// Constantes — mirror literal de TotemBondingCurve.sol
// ════════════════════════════════════════════════════════════════════════════

export const INITIAL_PRICE_WLD = 55n * 10n ** 7n;   // 5.5e8 wei (literal del .sol)
export const SCALE             = 10n ** 20n;
export const CURVE_K           = 235n;

export const BUY_FEE_BPS       = 200n;
export const SELL_FEE_BPS      = 300n;
export const FEE_DENOMINATOR   = 10_000n;

export const OWNER_MAX_BPS     = 2500n;
export const USER_MAX_BPS      = 1000n;

export const MAX_SELL_BPS_DEFAULT = 4500n;          // contrato: maxSellBps mutable, default 4500
export const SELL_WINDOW_SEC      = 86_400n;         // 1 day

export const SCORE_MIN  = 975n;
export const SCORE_MAX  = 1025n;
export const SCORE_BASE = 1000n;

export const WAD = 10n ** 18n;                       // helper conversión human ↔ wei

// ════════════════════════════════════════════════════════════════════════════
// Errors tipados (mismos nombres que .sol)
// ════════════════════════════════════════════════════════════════════════════

export class CurveError extends Error {
  constructor(code, message) {
    super(message ?? code);
    this.name = "CurveError";
    this.code = code;
  }
}

const err = (code, msg) => new CurveError(code, msg);

// ════════════════════════════════════════════════════════════════════════════
// Helpers BigInt (mirror Solidity uint256 truncating division)
// ════════════════════════════════════════════════════════════════════════════

const toBI = (x) => {
  if (typeof x === "bigint") return x;
  if (typeof x === "number") {
    if (!Number.isFinite(x)) throw err("InvalidInput", "non-finite number");
    return BigInt(Math.trunc(x));
  }
  if (typeof x === "string") return BigInt(x);
  throw err("InvalidInput", `cannot convert ${typeof x} to BigInt`);
};

const absBI = (x) => (x < 0n ? -x : x);

// ════════════════════════════════════════════════════════════════════════════
// Curve primitives — mirror EXACTO del contrato
// ════════════════════════════════════════════════════════════════════════════

/**
 * V(s) = INITIAL_PRICE_WLD * s + (CURVE_K * s³ / SCALE²) / 3
 * Mirror Solidity con truncación uint256 idéntica.
 */
export function V(s) {
  const sBI = toBI(s);
  const linear = INITIAL_PRICE_WLD * sBI;
  const s2     = (sBI * sBI) / SCALE;
  const s3     = (s2 * sBI) / SCALE;
  const cubic  = (CURVE_K * s3) / 3n;
  return linear + cubic;
}

/**
 * dV(s) = INITIAL_PRICE_WLD + CURVE_K * s² / SCALE
 */
export function dV(s) {
  const sBI = toBI(s);
  const s2  = (sBI * sBI) / SCALE;
  return INITIAL_PRICE_WLD + CURVE_K * s2;
}

/**
 * _safeScore: si score fuera de [SCORE_MIN, SCORE_MAX] o falla → SCORE_BASE.
 * El contrato lo hace via try/catch sobre oracle.getScore(). Aquí recibimos
 * score ya leído (BigInt o number); si es null/undefined → SCORE_BASE.
 */
export function safeScore(scoreRaw) {
  if (scoreRaw === null || scoreRaw === undefined) return SCORE_BASE;
  let s;
  try { s = toBI(scoreRaw); } catch { return SCORE_BASE; }
  if (s < SCORE_MIN || s > SCORE_MAX) return SCORE_BASE;
  return s;
}

/**
 * _effective(real, score) = (real * score) / SCORE_BASE
 */
export function effective(real, score) {
  return (toBI(real) * toBI(score)) / SCORE_BASE;
}

/**
 * _solveBuyEff(s0Eff, wldIn) — mirror EXACTO Solidity:
 *   1. seed: s1 = s0 + wldIn / dV(s0)
 *   2. Newton 10 iter con clamp |delta| ≤ s1/4
 *   3. Binary search 32 iter como fallback
 *   4. return (low+high)/2
 */
export function _solveBuyEff(s0Eff, wldIn) {
  const s0     = toBI(s0Eff);
  const wld    = toBI(wldIn);
  const target = V(s0) + wld;

  const dv0 = dV(s0);
  if (dv0 === 0n) return s0;

  let s1 = s0 + wld / dv0;

  // Newton — Solidity usa int256 con clamp ±s1/4
  for (let i = 0; i < 10; i++) {
    const v1 = V(s1);
    const f  = v1 - target;            // int256 equiv
    const df = dV(s1);                 // int256 equiv (siempre > 0)

    if (df === 0n || f === 0n) return s1;

    let delta = f / df;                // división truncating
    if (delta === 0n) return s1;

    const maxStep = s1 / 4n;
    if (delta > maxStep)   delta = maxStep;
    if (delta < -maxStep)  delta = -maxStep;

    if (delta > 0n) {
      // .sol: s1Eff -= uint256(delta)
      // si delta > s1 → underflow revert. Mirror: lanza.
      if (delta > s1) throw err("NewtonUnderflow", "Newton step underflow");
      s1 -= delta;
    } else {
      s1 += -delta;
    }
  }

  // Binary search fallback — mirror exacto
  let low  = s0;
  let high = s1 > s0 ? s1 : s0 + 1n;

  // Expandir high hasta que V(high) ≥ target. Solidity hace high*=2 con guard
  // contra overflow uint256/2. En BigInt no hay overflow, pero respetamos
  // un cap defensivo para no entrar en loop infinito.
  let safetyExpand = 0;
  while (V(high) < target) {
    if (safetyExpand++ > 256) break;
    high *= 2n;
  }

  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2n;
    const v   = V(mid);
    if (v > target) high = mid;
    else            low  = mid;
  }

  return (low + high) / 2n;
}

// ════════════════════════════════════════════════════════════════════════════
// API canonical — Buy
// ════════════════════════════════════════════════════════════════════════════

/**
 * solveBuyExact — mirror del flujo buy() del contrato (sin transferFrom).
 *
 * @param {object} p
 * @param {bigint|number|string} p.realSupply   - realSupply[totem] actual (BigInt-ready)
 * @param {bigint|number|string|null} p.scoreRaw - score crudo del oracle (null → SCORE_BASE)
 * @param {bigint|number|string} p.wldIn        - amountWldIn (en wld-wei)
 * @returns {{
 *   tokensOut: bigint, fee: bigint, netWld: bigint,
 *   newRealSupply: bigint, s0Eff: bigint, s1Eff: bigint, score: bigint
 * }}
 * @throws CurveError ZeroAmount
 */
export function solveBuyExact({ realSupply, scoreRaw, wldIn }) {
  const real = toBI(realSupply);
  const win  = toBI(wldIn);
  if (win === 0n) throw err("ZeroAmount", "wldIn must be > 0");

  const score  = safeScore(scoreRaw);
  const fee    = (win * BUY_FEE_BPS) / FEE_DENOMINATOR;
  const netWld = win - fee;

  const s0Eff = effective(real, score);
  const s1Eff = _solveBuyEff(s0Eff, netWld);

  // tokensOut = ((s1Eff - s0Eff) * SCORE_BASE) / score
  const tokensOut = ((s1Eff - s0Eff) * SCORE_BASE) / score;

  return {
    tokensOut,
    fee,
    netWld,
    newRealSupply: real + tokensOut,
    s0Eff,
    s1Eff,
    score,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// API canonical — Sell
// ════════════════════════════════════════════════════════════════════════════

/**
 * solveSellExact — mirror del flujo sell() del contrato.
 *
 * Reproduce EXACTO:
 *   - Reset de sell-window si block.timestamp > lastReset + SELL_WINDOW
 *   - Validación SellLimitExceeded sobre maxSellBps del balance del usuario
 *   - effective supply, deltaEff, baseValue = V(s0) - V(s1), fee, payout
 *   - Validación InsufficientBalance si tokensIn > userBalance ó deltaEff > s0Eff
 *
 * @param {object} p
 * @param {bigint|number|string} p.realSupply
 * @param {bigint|number|string|null} p.scoreRaw
 * @param {bigint|number|string} p.userBalance      - balances[totem][user]
 * @param {bigint|number|string} p.soldInWindow     - sellWindows[totem][user].sold (post-reset)
 * @param {bigint|number|string} p.lastReset        - sellWindows[totem][user].lastReset (unix sec)
 * @param {bigint|number|string} p.tokensIn
 * @param {bigint|number|string} p.now              - block.timestamp (unix sec)
 * @param {bigint|number|string} [p.maxSellBps]     - default 4500
 * @returns {{
 *   wldOut: bigint, fee: bigint, baseValue: bigint,
 *   newRealSupply: bigint, newSoldInWindow: bigint, newLastReset: bigint,
 *   deltaEff: bigint, s0Eff: bigint, s1Eff: bigint, score: bigint
 * }}
 * @throws CurveError ZeroAmount | InsufficientBalance | SellLimitExceeded
 */
export function solveSellExact({
  realSupply, scoreRaw,
  userBalance, soldInWindow, lastReset,
  tokensIn, now,
  maxSellBps = MAX_SELL_BPS_DEFAULT,
}) {
  const real = toBI(realSupply);
  const tin  = toBI(tokensIn);
  const ub   = toBI(userBalance);
  const nowBI    = toBI(now);
  const lastBI   = toBI(lastReset);
  const maxBpsBI = toBI(maxSellBps);

  if (tin === 0n) throw err("ZeroAmount", "tokensIn must be > 0");
  if (tin > ub)   throw err("InsufficientBalance", "tokensIn > userBalance");

  // Sell-window reset (mirror Solidity)
  let sold = toBI(soldInWindow);
  let reset = lastBI;
  if (nowBI > lastBI + SELL_WINDOW_SEC) {
    sold  = 0n;
    reset = nowBI;
  }

  if (sold + tin > (ub * maxBpsBI) / 10_000n) {
    throw err("SellLimitExceeded", "sell window cap exceeded");
  }

  const score = safeScore(scoreRaw);
  const s0Eff = effective(real, score);
  const deltaEff = (tin * score) / SCORE_BASE;

  if (deltaEff > s0Eff) throw err("InsufficientBalance", "deltaEff > s0Eff");

  const s1Eff = s0Eff - deltaEff;

  const baseValue = V(s0Eff) - V(s1Eff);
  const fee       = (baseValue * SELL_FEE_BPS) / FEE_DENOMINATOR;
  const payout    = baseValue - fee;

  return {
    wldOut: payout,
    fee,
    baseValue,
    newRealSupply: real - tin,
    newSoldInWindow: sold + tin,
    newLastReset: reset,
    deltaEff,
    s0Eff,
    s1Eff,
    score,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// API canonical — Position limit
// ════════════════════════════════════════════════════════════════════════════

/**
 * Mirror del check post-buy:
 *   if (realSupply != 0) {
 *     maxBps = isOwner ? OWNER_MAX_BPS : USER_MAX_BPS;
 *     if (newBalance > supplyAfter * maxBps / 10000) revert MaxPositionExceeded();
 *   }
 */
export function checkPositionLimit({ isOwner, userBalanceAfter, supplyAfter }) {
  const sup = toBI(supplyAfter);
  if (sup === 0n) return;
  const bal = toBI(userBalanceAfter);
  const cap = isOwner ? OWNER_MAX_BPS : USER_MAX_BPS;
  if (bal > (sup * cap) / 10_000n) {
    throw err("MaxPositionExceeded", `position > ${isOwner ? "25%" : "10%"} of supply`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Spot price (precio marginal en wld-wei por unidad-base de supply efectiva)
// ════════════════════════════════════════════════════════════════════════════

/**
 * spotPriceWei: precio marginal del próximo wei-unit de supply efectiva.
 * Mirror: dV(_effective(realSupply, safeScore(score))).
 * Devuelve BigInt en wld-wei. Para humanos usar formatHumanPrice().
 */
export function spotPriceWei({ realSupply, scoreRaw }) {
  const score = safeScore(scoreRaw);
  return dV(effective(realSupply, score));
}

// ════════════════════════════════════════════════════════════════════════════
// Conversiones human ↔ wei (helpers explícitos para wrappers/endpoints)
// ════════════════════════════════════════════════════════════════════════════

/** WLD float → wei BigInt. Trunca al wei. */
export function wldToWei(wldHuman) {
  if (typeof wldHuman === "bigint") return wldHuman;
  const n = Number(wldHuman);
  if (!Number.isFinite(n) || n < 0) throw err("InvalidInput", "wldHuman invalid");
  // 18 decimales de precisión suficiente vía string para evitar drift float
  const [intp, fracp = ""] = n.toFixed(18).split(".");
  const frac = (fracp + "0".repeat(18)).slice(0, 18);
  return BigInt(intp) * WAD + BigInt(frac);
}

/** wei BigInt → WLD float (puede perder precisión, solo para UI advisory). */
export function weiToWld(wei) {
  const w = toBI(wei);
  const intp = w / WAD;
  const frac = w % WAD;
  return Number(intp) + Number(frac) / 1e18;
}

/**
 * Tokens humanos → unidades internas del contrato.
 * Por convención assumida (ver header), 1 token human = 1 unit interno.
 * NO multiplica por WAD. Helper provisto solo para simetría con WLD.
 */
export function tokensToUnits(tokensHuman) {
  if (typeof tokensHuman === "bigint") return tokensHuman;
  const n = Math.trunc(Number(tokensHuman));
  if (!Number.isFinite(n) || n < 0) throw err("InvalidInput", "tokensHuman invalid");
  return BigInt(n);
}

/** Unidades internas BigInt → tokens humanos (entero floor / Number cast). */
export function unitsToTokens(units) {
  const u = toBI(units);
  // Cast seguro hasta 2^53 (~9e15 tokens). Above eso, devolver BigInt-safe via Number drift acceptable for UI.
  return Number(u);
}

// Aliases legacy (DEPRECATED — usar tokensToUnits/unitsToTokens)
export const tokensToWei = tokensToUnits;
export const weiToTokens = unitsToTokens;

// ════════════════════════════════════════════════════════════════════════════
// Wrappers compatibility — DEPRECADOS, eliminar en Fase 7-8
// Mantienen las firmas actuales de buy.mjs / sellPreview.mjs / create.mjs
// para no romper el build durante la migración. Toda la matemática delega
// en las APIs canonical exactas.
// ════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use solveBuyExact (BigInt). Wrapper para buy.mjs legacy.
 *
 * Convención asumida: wldIn en WLD humanos, supply en tokens humanos.
 * Devuelve shape legacy esperado por endpoints actuales.
 */
export function solveBuy(wldInHuman, supplyHuman, opts = {}) {
  const realSupply = tokensToUnits(supplyHuman ?? 0);
  const wldIn      = wldToWei(wldInHuman);
  const r = solveBuyExact({
    realSupply,
    scoreRaw: opts.score ?? null,
    wldIn,
  });
  return {
    tokensOut:  unitsToTokens(r.tokensOut),
    fee:        weiToWld(r.fee),
    netWld:     weiToWld(r.netWld),
    newSupply:  unitsToTokens(r.newRealSupply),
    newPrice:   weiToWld(spotPriceWei({
      realSupply: r.newRealSupply,
      scoreRaw:   opts.score ?? null,
    })),
  };
}

/**
 * @deprecated Use solveSellExact (BigInt). Wrapper para sellPreview.mjs legacy.
 *
 * Esta versión NO valida sell-window ni userBalance (sellPreview.mjs ya lo
 * hace contra DB). Solo calcula la matemática del payout.
 */
export function previewSell(tokensInHuman, supplyHuman, opts = {}) {
  const realSupply = tokensToUnits(supplyHuman ?? 0);
  const tokensIn   = tokensToUnits(tokensInHuman);

  // Mirror sin window validation: usar parámetros que la desactivan.
  // userBalance = tokensIn (suficiente), sold=0, lastReset=now, maxBps=10000.
  const now = BigInt(Math.floor(Date.now() / 1000));
  const r = solveSellExact({
    realSupply,
    scoreRaw:    opts.score ?? null,
    userBalance: tokensIn,
    soldInWindow: 0n,
    lastReset:    now,
    tokensIn,
    now,
    maxSellBps:   10_000n,
  });

  return {
    wldOut:      weiToWld(r.wldOut),
    fee:         weiToWld(r.fee),
    baseValue:   weiToWld(r.baseValue),
    priceAfter:  weiToWld(spotPriceWei({
      realSupply: r.newRealSupply,
      scoreRaw:   opts.score ?? null,
    })),
    supplyAfter: unitsToTokens(r.newRealSupply),
  };
}

/**
 * @deprecated Use spotPriceWei (BigInt). Wrapper para create.mjs legacy.
 * Devuelve precio marginal en WLD humanos a un supply humano dado.
 */
export function spotPrice(supplyHuman, opts = {}) {
  return weiToWld(spotPriceWei({
    realSupply: tokensToUnits(supplyHuman ?? 0),
    scoreRaw:   opts.score ?? null,
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// Self-check parity helper (callable desde tests con vectores del .sol)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Verifica que V/dV/solveBuyEff den los mismos valores que el contrato
 * para un set de vectores conocidos (a poblar al deploy).
 * @param {Array<{kind:'V'|'dV'|'solveBuyEff', input:any[], expect:bigint}>} vectors
 * @returns {{passed:number, failed:number, failures:Array}}
 */
export function assertSolidityParity(vectors) {
  const result = { passed: 0, failed: 0, failures: [] };
  for (const v of vectors) {
    let actual;
    try {
      if (v.kind === "V")             actual = V(v.input[0]);
      else if (v.kind === "dV")       actual = dV(v.input[0]);
      else if (v.kind === "solveBuyEff") actual = _solveBuyEff(v.input[0], v.input[1]);
      else throw new Error(`unknown kind ${v.kind}`);
    } catch (e) {
      result.failed++;
      result.failures.push({ ...v, error: e.message });
      continue;
    }
    if (actual === toBI(v.expect)) result.passed++;
    else {
      result.failed++;
      result.failures.push({ ...v, actual, diff: actual - toBI(v.expect) });
    }
  }
  return result;
}

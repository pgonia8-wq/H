/**
 * viewModelBuilder.mjs — Composición canónica del viewModel.
 *
 * Ley A4: puro, determinista, sin creatividad, ≤200 líneas efectivas.
 * Recibe `raw` (del truthResolver) y `now`, devuelve viewModel versionado
 * por subdominio. Toda matemática delega en mirrors. NO deriva reglas.
 *
 * Invariantes chequeados por viewModelBuilder.prop.test.mjs:
 *   - score.delta = score.value - 1000
 *   - progression.graduation.overallBps = min(4 gates)
 *   - status.overall ∈ {FRAUD_LOCKED, FROZEN, GRADUATED, EMERGENCY, OK}
 *     (orden de precedencia exacto)
 *   - todo campo lleva source ∈ {onchain, indexed, db, mirror} + stale:bool
 *   - ningún campo viola su SLA sin stale:true
 *   - compose(compose(raw)) === compose(raw)   (idempotencia)
 */

import { resolveField } from "./fieldPriority.mjs";
import { checkSLA } from "./truthSLA.mjs";
import {
  BondingCurve, Graduation, HumanTotem, TotemSync,
} from "./protocolConstants.mjs";

const PROTOCOL_VERSION = "0.2.0";

function field(path, sources, meta = {}) {
  const r = resolveField(path, sources);
  return { value: r.value, source: r.source, stale: r.stale, ...meta };
}

function applySLA(subdomain, obj, fetchedAt, nowSec) {
  const sla = checkSLA(subdomain, fetchedAt, nowSec);
  if (sla.stale) {
    for (const k of Object.keys(obj)) {
      if (obj[k] && typeof obj[k] === "object" && "source" in obj[k]) {
        obj[k].stale = obj[k].stale || sla.stale;
      }
    }
    obj._sla = { stale: true, ageSec: sla.ageSec, budgetSec: sla.budgetSec, reason: sla.staleReason };
  } else {
    obj._sla = { stale: false, ageSec: sla.ageSec, budgetSec: sla.budgetSec, reason: null };
  }
  return obj;
}

function clampBps(num, den) {
  if (!den || den <= 0) return 0;
  const r = Math.floor((num / den) * 10000);
  return Math.max(0, Math.min(10000, r));
}

function computeStatusOverall(s) {
  // Precedencia fija — la misma en frontend, siempre.
  if (s.fraudLocked.value === true)   return "FRAUD_LOCKED";
  if (s.frozen.value === true)        return "FROZEN";
  if (s.graduated.value === true)     return "GRADUATED";
  if (s.emergencyMode.value === true) return "EMERGENCY";
  return "OK";
}

function computeGraduation(supply, verifiedVolumeWei, levelValue, ageSec) {
  const levelBps  = clampBps(Number(levelValue ?? 1), Number(Graduation.MIN_LEVEL));
  const supplyBps = clampBps(Number(supply ?? 0), Number(Graduation.MIN_SUPPLY));
  const volumeBps = clampBps(Number(verifiedVolumeWei ?? 0), Number(Graduation.MIN_VOLUME_WEI));
  const ageBps    = clampBps(Number(ageSec ?? 0), Number(Graduation.MIN_AGE_SEC));
  const gates = {
    level:  { have: Number(levelValue ?? 0), need: Number(Graduation.MIN_LEVEL), ratioBps: levelBps },
    supply: { have: Number(supply ?? 0), need: Number(Graduation.MIN_SUPPLY), ratioBps: supplyBps },
    volume: { have: String(verifiedVolumeWei ?? "0"), need: String(Graduation.MIN_VOLUME_WEI), ratioBps: volumeBps, uses: "verifiedVolume" },
    age:    { have: Number(ageSec ?? 0), need: Number(Graduation.MIN_AGE_SEC), ratioBps: ageBps },
  };
  const overallBps = Math.min(levelBps, supplyBps, volumeBps, ageBps);
  const bottleneck = [
    ["level", levelBps], ["supply", supplyBps], ["volume", volumeBps], ["age", ageBps],
  ].sort((a, b) => a[1] - b[1])[0][0];
  return { gates, bottleneckGate: bottleneck, overallBps, eligible: overallBps >= 10000 };
}

function humanTotemFeeBps(scoreValue) {
  const s = Number(scoreValue ?? 1000);
  if (s < Number(HumanTotem.SCORE_THRESHOLD_CRITICAL)) return Number(HumanTotem.FEE_BPS_CRITICAL);
  if (s < Number(HumanTotem.SCORE_THRESHOLD_LOW))      return Number(HumanTotem.FEE_BPS_LOW);
  return Number(HumanTotem.FEE_BPS_DEFAULT);
}

function levelProgress(totalAcc, level) {
  const thresholds = TotemSync.LEVEL_THRESHOLDS.map(Number);
  const idx = Math.max(0, Math.min(thresholds.length - 1, Number(level ?? 1) - 1));
  const next = thresholds[idx];
  const prev = idx > 0 ? thresholds[idx - 1] : 0;
  const acc  = Number(totalAcc ?? 0);
  if (next <= prev) return { nextThreshold: next, progressBps: 10000 };
  const progressBps = clampBps(Math.max(0, acc - prev), next - prev);
  return { nextThreshold: next, progressBps };
}

/**
 * Composición canónica pura.
 * @param {{onchain, indexed, db, userContext, fetchedAt, nowSec}} raw
 * @returns viewModel
 */
export function compose(raw) {
  const { onchain = {}, indexed = {}, db = {}, userContext = null, fetchedAt, nowSec } = raw;
  const o = onchain || {};  const i = indexed || {};  const m = db || {};

  // ──────── identity (db-sourced, symbol hybrid)
  const identity = applySLA("identity", {
    _v: "identity_v1",
    name:   field("identity.name",   { onchain: o.name,   indexed: i.name,   db: m.name }),
    owner:  field("identity.owner",  { onchain: o.owner,  indexed: i.owner,  db: m.owner }),
    symbol: field("identity.symbol", { onchain: o.symbol, db: m.name ? m.name.split(/\s+/).map(w => w[0]).join("").slice(0,4).toUpperCase() : null, isGraduated: !!o.graduated }),
  }, fetchedAt.db, nowSec);

  // ──────── status (onchain_only)
  const statusFields = {
    graduated:     field("status.graduated",     { onchain: o.graduated }),
    ammPair:       field("status.ammPair",       { onchain: o.ammPair }),
    fraudLocked:   field("status.fraudLocked",   { onchain: o.fraudLocked }),
    frozen:        field("status.frozen",        { onchain: o.frozen }),
    emergencyMode: field("status.emergencyMode", { onchain: o.emergencyMode }),
    isHuman:       field("status.isHuman",       { onchain: o.isHuman }),
    isTotem:       field("status.isTotem",       { onchain: o.isTotem }),
  };
  const status = applySLA("status", { _v: "status_v1", ...statusFields, overall: computeStatusOverall(statusFields) }, fetchedAt.onchain, nowSec);

  // ──────── oracle
  const scoreVal = o.score != null ? o.score : i.score;
  const oracle = applySLA("oracle", {
    _v: "oracle_v1",
    score:     field("oracle.score",     { onchain: o.score,     indexed: i.score }),
    influence: field("oracle.influence", { onchain: o.influence, indexed: i.influence }),
    signedAt:  field("oracle.signedAt",  { onchain: o.signedAt }),
    scoreDelta:     { value: scoreVal != null ? Number(scoreVal) - 1000 : null, source: o.score != null ? "onchain" : "indexed", stale: scoreVal == null },
    influenceDelta: { value: (o.influence ?? i.influence) != null ? Number(o.influence ?? i.influence) - 1000 : null, source: o.influence != null ? "onchain" : "indexed", stale: (o.influence ?? i.influence) == null },
  }, fetchedAt.onchain ?? fetchedAt.indexed, nowSec);

  // ──────── market
  const marketFetched = fetchedAt.onchain ?? fetchedAt.indexed;
  const market = applySLA("market.volume", {
    _v: "market_v1",
    price:          field("market.price",          { onchain: o.price,          indexed: i.price }),
    supply:         field("market.supply",         { onchain: o.supply,         indexed: i.supply }),
    rawVolume:      field("market.rawVolume",      { onchain: o.rawVolume,      indexed: i.rawVolume }),
    verifiedVolume: field("market.verifiedVolume", { onchain: o.verifiedVolume }),
    volumeShown:    { value: (o.verifiedVolume ?? 0) > 0 ? o.verifiedVolume : (i.rawVolume ?? 0), source: o.verifiedVolume != null ? "onchain" : "indexed", stale: false, note: "verified_preferred" },
    createdAt:      field("market.createdAt",      { onchain: o.createdAt,      indexed: i.createdAt }),
    lastTradeAt:    field("market.lastTradeAt",    { onchain: o.lastTradeAt,    indexed: i.lastTradeAt }),
    ageSec:         { value: Math.max(0, Number(nowSec) - Number(o.createdAt ?? i.createdAt ?? nowSec)), source: o.createdAt != null ? "onchain" : "indexed", stale: false },
  }, marketFetched, nowSec);

  // ──────── progression
  const lv = o.level != null ? o.level : i.level;
  const progression = applySLA("progression", {
    _v: "progression_v1",
    level:                  field("progression.level",                  { onchain: o.level,                  indexed: i.level }),
    badge:                  field("progression.badge",                  { onchain: o.badge,                  indexed: i.badge }),
    totalScoreAccumulated:  field("progression.totalScoreAccumulated",  { onchain: o.totalScoreAccumulated }),
    negativeEvents:         field("progression.negativeEvents",         { onchain: o.negativeEvents }),
    levelProgress:          { value: levelProgress(o.totalScoreAccumulated, lv), source: "mirror", stale: false },
    graduation:             { value: computeGraduation(o.supply ?? i.supply, o.verifiedVolume, lv, Number(nowSec) - Number(o.createdAt ?? i.createdAt ?? nowSec)), source: "mirror", stale: false },
  }, fetchedAt.onchain ?? fetchedAt.indexed, nowSec);

  // ──────── userContext
  const uc = userContext || {};
  const userCtx = applySLA("userContext", {
    _v: "userContext_v1",
    balance:         field("userContext.balance",         { onchain: o.userBalance,  indexed: uc.balance }),
    sellWindowUsed:  field("userContext.sellWindowUsed",  { onchain: o.soldInWindow, indexed: uc.soldInWindow }),
    credits:         field("userContext.credits",         { onchain: o.credits }),
  }, fetchedAt.onchain ?? fetchedAt.userContext, nowSec);

  // ──────── trading (mirror constants + onchain dynamics)
  const trading = applySLA("trading", {
    _v: "trading_v1",
    buyFeeBps:        field("trading.buyFeeBps",        { onchain: Number(BondingCurve.BUY_FEE_BPS) }),
    sellFeeBps:       field("trading.sellFeeBps",       { onchain: Number(BondingCurve.SELL_FEE_BPS) }),
    ownerCapBps:      field("trading.ownerCapBps",      { onchain: Number(BondingCurve.OWNER_MAX_BPS) }),
    userCapBps:       field("trading.userCapBps",       { onchain: Number(BondingCurve.USER_MAX_BPS) }),
    humanTotemFeeBps: field("trading.humanTotemFeeBps", { onchain: humanTotemFeeBps(scoreVal) }),
    rateLimit:        field("trading.rateLimit",        { onchain: o.rateLimit }),
  }, fetchedAt.onchain, nowSec);

  return {
    address:         raw.address ?? null,
    protocolVersion: PROTOCOL_VERSION,
    fetchedAt:       nowSec,
    identity,
    status,
    oracle,
    market,
    progression,
    userContext: userCtx,
    trading,
  };
}

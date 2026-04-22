/**
 * graduation.mjs — Mirror BigInt ACTUALIZADO
 * Se ha corregido la lógica de calcLiquidityAmounts para evitar el bug de 36 decimales.
 */

import { Graduation as G } from "./protocolConstants.mjs";

export class GraduationError extends Error {
  constructor(code, reason) {
    super(reason ? `${code}: ${reason}` : code);
    this.name = "GraduationError";
    this.code = code;
    this.reason = reason;
  }
}

export const NOT_ELIGIBLE_REASONS = Object.freeze({
  NOT_REGISTERED:  "NOT_REGISTERED",
  LEVEL_TOO_LOW:   "LEVEL_TOO_LOW",
  SUPPLY_TOO_LOW:  "SUPPLY_TOO_LOW",
  VOLUME_TOO_LOW:  "VOLUME_TOO_LOW",
  TOO_YOUNG:       "TOO_YOUNG",
});

export function getVolume(verifiedVolume) {
  if (typeof verifiedVolume !== "bigint") throw new TypeError("getVolume: verifiedVolume must be bigint");
  return verifiedVolume === 0n ? 0n : verifiedVolume;
}

export function canGraduate({ alreadyGraduated, fraudLocked, level, supply, createdAt, verifiedVolume, now, params = G }) {
  if (alreadyGraduated) return { eligible: false, reason: "ALREADY_GRADUATED" };
  if (fraudLocked)      return { eligible: false, reason: "FRAUD_LOCKED" };
  if (createdAt === 0n) return { eligible: false, reason: NOT_ELIGIBLE_REASONS.NOT_REGISTERED };

  const volume = getVolume(verifiedVolume);

  if (level   < params.MIN_LEVEL)      return { eligible: false, reason: NOT_ELIGIBLE_REASONS.LEVEL_TOO_LOW };
  if (supply  < params.MIN_SUPPLY)     return { eligible: false, reason: NOT_ELIGIBLE_REASONS.SUPPLY_TOO_LOW };
  if (volume  < params.MIN_VOLUME_WEI) return { eligible: false, reason: NOT_ELIGIBLE_REASONS.VOLUME_TOO_LOW };
  if (now     < createdAt + params.MIN_AGE_SEC) return { eligible: false, reason: NOT_ELIGIBLE_REASONS.TOO_YOUNG };
  
  return { eligible: true, reason: null };
}

/**
 * calcLiquidityAmounts mirror — CORREGIDO
 * @param {bigint} p.supply - curve.realSupply (¡YA VIENE EN WEI!)
 * @param {bigint} p.price  - curve.getPrice (wei por token)
 */
export function calcLiquidityAmounts({ supply, price, liquidityBps = G.LIQUIDITY_BPS }) {
  if (typeof supply !== "bigint" || typeof price !== "bigint") throw new TypeError("Must be bigint");
  if (supply <= 0n) throw new GraduationError("NoSupply", "supply must be > 0");

  // FIX: El supply ya está en Wei, solo aplicamos el porcentaje de liquidez
  const amountTokenWei = (supply * liquidityBps) / G.BPS_DENOMINATOR;
  
  // FIX: Calculamos WLD cancelando los 18 decimales del precio
  const amountWLD = (amountTokenWei * price) / G.WEI_PER_TOKEN;

  return { amountTokenWei, amountWLD };
}

export function graduationPreview(input) {
  const params = input.params ?? G;
  const r = canGraduate(input);
  const volume = getVolume(input.verifiedVolume);
  const age = input.createdAt === 0n ? 0n : (input.now - input.createdAt);

  return {
    eligible: r.eligible,
    reason:   r.reason,
    gaps: {
      level:  { required: params.MIN_LEVEL, current: input.level, missing: input.level >= params.MIN_LEVEL ? 0n : params.MIN_LEVEL - input.level },
      supply: { required: params.MIN_SUPPLY, current: input.supply, missing: input.supply >= params.MIN_SUPPLY ? 0n : params.MIN_SUPPLY - input.supply },
      volume: { required: params.MIN_VOLUME_WEI, current: volume, missing: volume >= params.MIN_VOLUME_WEI ? 0n : params.MIN_VOLUME_WEI - volume },
      age:    { required: params.MIN_AGE_SEC, current: age, missing: age >= params.MIN_AGE_SEC ? 0n : params.MIN_AGE_SEC - age }
    },
  };
}

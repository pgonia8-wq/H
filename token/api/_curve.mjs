import { fetchWldUsdRate } from "./wldRate.mjs";

const TOTAL_SUPPLY  = 100_000_000;
const A             = 0.000001;
const B             = 5.7e-21;

const BUY_FEE             = 0.025;
const SELL_FEE            = 0.04;
const MAX_SELL_PERCENT    = 0.10;
const GRADUATION_WLD      = 2000;
const GRADUATION_HOLDERS  = 300;
const GRADUATION_BUYERS   = 150;
const POOL_PERCENT        = 0.70;
const TREASURY_PERCENT    = 0.30;
const CREATOR_LOCK_HOURS  = 24;
const MAX_CREATOR_HOLD    = 0.10;
const WLD_USD             = 1.0;
const MAX_RETRIES         = 3;

export async function getWldUsdRate() {
  try {
    return await fetchWldUsdRate();
  } catch {
    return WLD_USD;
  }
}

export function spotPrice(s) {
  return A + B * s * s;
}

export function V(s) {
  return A * s + (B * s * s * s) / 3;
}

export function solveBuy(amountWld, currentSupply) {
  const netWld = amountWld / (1 + BUY_FEE);
  const fee    = amountWld - netWld;

  const targetV = V(currentSupply) + netWld;

  let s1 = currentSupply + netWld / spotPrice(currentSupply);

  for (let i = 0; i < 50; i++) {
    const fVal = V(s1) - targetV;
    const dVal = spotPrice(s1);
    if (dVal === 0) break;
    const step = fVal / dVal;
    s1 -= step;
    if (s1 < currentSupply) s1 = currentSupply;
    if (Math.abs(step) < 0.5) break;
  }

  s1 = Math.min(s1, TOTAL_SUPPLY);
  s1 = Math.max(s1, currentSupply);

  const tokensOut = Math.floor(s1 - currentSupply);

  return {
    tokensOut,
    fee,
    netWld,
    newSupply: currentSupply + tokensOut,
    newPrice:  spotPrice(currentSupply + tokensOut),
  };
}

export function solveSell(tokensToSell, currentSupply) {
  const s0 = currentSupply;
  const s1 = s0 - tokensToSell;
  if (s1 < 0) throw new Error("Cannot sell more than circulating supply");

  if (tokensToSell > currentSupply * MAX_SELL_PERCENT) {
    throw new Error("Sell exceeds max " + (MAX_SELL_PERCENT * 100) + "% of supply per transaction");
  }

  const curveReturn   = V(s0) - V(s1);
  const fee           = curveReturn * SELL_FEE;
  const wldReceived   = curveReturn - fee;

  return {
    wldReceived,
    fee,
    slippageAmt: 0,
    totalFees: fee,
    curveReturn,
    newSupply:  s1,
    newPrice:   spotPrice(s1),
  };
}

export function curvePercent(totalWldInCurve) {
  return Math.min(100, (totalWldInCurve / GRADUATION_WLD) * 100);
}

export function checkGraduation(totalWldInCurve, holders) {
  return totalWldInCurve >= GRADUATION_WLD && holders >= GRADUATION_HOLDERS;
}

export function graduationSplit(totalWld) {
  return {
    toPool:     totalWld * POOL_PERCENT,
    toTreasury: totalWld * TREASURY_PERCENT,
  };
}

export {
  TOTAL_SUPPLY, BUY_FEE, SELL_FEE, MAX_SELL_PERCENT,
  GRADUATION_WLD, GRADUATION_HOLDERS, GRADUATION_BUYERS,
  POOL_PERCENT, TREASURY_PERCENT,
  CREATOR_LOCK_HOURS, MAX_CREATOR_HOLD,
  WLD_USD, MAX_RETRIES,
  A as INITIAL_PRICE, B as B_COEFFICIENT,
};

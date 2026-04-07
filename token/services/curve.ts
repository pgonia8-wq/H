const A = 0.000001;
const B = 5.7e-21;
const BUY_FEE = 0.025;
const SELL_FEE = 0.04;

function spotPrice(s: number): number {
  return A + B * s * s;
}

function V(s: number): number {
  return A * s + (B * s * s * s) / 3;
}

export function estimateBuy(amountWld: number, currentSupply: number): number {
  if (amountWld <= 0 || currentSupply < 0) return 0;
  const netWld = amountWld / (1 + BUY_FEE);
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
  s1 = Math.min(s1, 100_000_000);
  s1 = Math.max(s1, currentSupply);
  return Math.max(0, Math.floor(s1 - currentSupply));
}

export function estimateSell(tokensToSell: number, currentSupply: number): number {
  if (tokensToSell <= 0 || tokensToSell > currentSupply) return 0;
  const curveReturn = V(currentSupply) - V(currentSupply - tokensToSell);
  return curveReturn * (1 - SELL_FEE);
}

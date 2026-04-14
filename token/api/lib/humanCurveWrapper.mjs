import { solveBuy, solveSell } from "./curve.mjs";

// 👇 esto viene del oracle (tu app principal)
export function applyInfluence(amount, influence) {

  const factor = influence / 100;

  return amount * factor;
}

// ========================
// BUY
// ========================

export function solveBuyWithHuman({
  amountWld,
  currentSupply,
  influence
}) {

  // 💥 modificas entrada
  const adjustedAmount = applyInfluence(amountWld, influence);

  const result = solveBuy(adjustedAmount, currentSupply);

  return {
    ...result,
    humanAdjusted: true,
    influence
  };
}

// ========================
// SELL
// ========================

export function solveSellWithHuman({
  tokensToSell,
  currentSupply,
  treasuryBalance,
  influence
}) {

  const result = solveSell(
    tokensToSell,
    currentSupply,
    treasuryBalance
  );

  // 💥 modificas salida
  const factor = influence / 100;

  return {
    ...result,
    wldReceived: result.wldReceived * factor,
    humanAdjusted: true,
    influence
  };
}

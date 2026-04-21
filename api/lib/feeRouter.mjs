/**
 * feeRouter.mjs — Mirror BigInt EXACTO de TotemFeeRouter.sol (C15)
 *
 * SOLE SOURCE OF TRUTH: tótem/contracts/TotemFeeRouter.sol
 *
 * Reflejado de harvest():
 *   require(balance > 0, "no fees");
 *   treasuryShare = (balance * 40) / 100;
 *   buybackShare  = (balance * 40) / 100;
 *   rewardShare   = balance - treasuryShare - buybackShare;   // (resto, ~20%)
 *   transfer(treasury, treasuryShare);
 *   transfer(buybackVault, buybackShare);
 *   transfer(rewardPool,   rewardShare);
 *
 * Nota: rewardShare se calcula por RESTA, NO por (balance * 20) / 100. Esto es
 * importante porque garantiza que la suma == balance EXACTO incluso con
 * truncation de división entera (mirror exacto del contrato).
 */

export const TREASURY_PCT = 40n;
export const BUYBACK_PCT  = 40n;
export const REWARD_PCT   = 20n;       // implícito: 100 - 40 - 40
export const PCT_DENOMINATOR = 100n;

/**
 * Mirror de harvest(). Devuelve el split previsto SIN ejecutar transfers.
 *
 * Resultado:
 *   { ok: false, reason: "no fees" }                                si balance <= 0
 *   { ok: true,  total, treasury, buyback, reward }                 si OK
 *
 * Invariante: treasury + buyback + reward === total (siempre, por el cálculo
 * por resta del último share).
 */
export function previewSplit(balance) {
  const b = BigInt(balance);
  if (b <= 0n) {
    return { ok: false, reason: "no fees", total: 0n, treasury: 0n, buyback: 0n, reward: 0n };
  }
  const treasury = (b * TREASURY_PCT) / PCT_DENOMINATOR;
  const buyback  = (b * BUYBACK_PCT)  / PCT_DENOMINATOR;
  const reward   = b - treasury - buyback;
  return { ok: true, total: b, treasury, buyback, reward };
}

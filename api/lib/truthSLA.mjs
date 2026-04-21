/**
 * truthSLA.mjs — SLA de staleness por subdominio del viewModel.
 *
 * Ley A2 de la reforma viewModel:
 *   Cada campo tiene una ventana máxima aceptable. Si al momento de
 *   componer el viewModel el dato viola su SLA, el builder marca
 *   `stale: true` + `staleReason`. El frontend SOLO renderiza el badge;
 *   NO decide qué es stale.
 *
 * Unidades: segundos. BigInt-compatible.
 * NO agregar subdominios sin documentarlos aquí.
 */

export const SLA_SEC = Object.freeze({
  identity:        24 * 3600,     // name/symbol/owner — casi inmutable
  status:          30,            // graduated/fraudLocked/frozen/emergency
  oracle:          600,           // 10 min (coincide con MAX_SCORE_STALENESS del contrato)
  "market.price":  15,            // spot price near-live
  "market.volume": 60,            // rolling 24h
  progression:     60,            // level/badge derivados
  userContext:     30,            // balance, sell window
  trading:         5,              // fee bps, rate limit counters
});

/**
 * Evalúa si un `fetchedAtSec` respeta su SLA respecto a `nowSec`.
 * @returns {{ stale: boolean, ageSec: number, budgetSec: number, staleReason: string | null }}
 */
export function checkSLA(subdomain, fetchedAtSec, nowSec) {
  const budget = SLA_SEC[subdomain];
  if (budget == null) {
    return { stale: false, ageSec: 0, budgetSec: 0, staleReason: null };
  }
  if (!fetchedAtSec || fetchedAtSec <= 0) {
    return { stale: true, ageSec: Number.MAX_SAFE_INTEGER, budgetSec: budget, staleReason: "no_timestamp" };
  }
  const ageSec = Math.max(0, Number(nowSec) - Number(fetchedAtSec));
  if (ageSec > budget) {
    return { stale: true, ageSec, budgetSec: budget, staleReason: `sla_exceeded:${subdomain}` };
  }
  return { stale: false, ageSec, budgetSec: budget, staleReason: null };
}

/** Utilidad para mensajes UI pre-cocinados. */
export function staleBadgeText(subdomain, ageSec, budgetSec) {
  return `Datos desactualizados ${ageSec}s (SLA ${budgetSec}s · ${subdomain})`;
}

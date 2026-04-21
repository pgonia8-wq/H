/**
 * GET /api/system/stability
 *
 * Estado de estabilidad del sistema, derivado del MIRROR off-chain de
 * TotemStabilityModule.sol (lib/stability.mjs).
 *
 * Por cada totem se calcula `stabilizationPreview` con los datos disponibles
 * en DB y se devuelve:
 *   {
 *     stable:     boolean,                // ningún totem en stress alto
 *     stressByTotem: [{ address, stress, buybackRate }],
 *     stale:      string[],               // addresses sin volumen 24h y supply > 0
 *     warnings:   string[],
 *   }
 *
 * NOTA: el contrato TotemBondingCurve tiene `frozen` mapping (estado seteado
 * por owner). El campo `stale` aquí NO equivale a `frozen` on-chain — es solo
 * heurística off-chain de actividad. Renombrado para evitar confusión.
 *
 * Para `lastPrice/lastVolume/avgReputation` usamos los snapshots disponibles
 * en DB. Cuando faltan inputs (totem nuevo, sin historial) → stress = 0.
 */

import { createClient } from "@supabase/supabase-js";
import { stabilizationPreview } from "../lib/stability.mjs";
import { Stability } from "../lib/protocolConstants.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Conversiones explícitas Number → BigInt (truncan a entero, todos los inputs
// del mirror son uint256 en el contrato).
const toBI = (n) => BigInt(Math.max(0, Math.trunc(Number(n) || 0)));

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("totems")
      .select("address, name, supply, price, volume_24h, score, last_price, last_volume, last_stabilization");

    if (error) {
      console.error("[/api/system/stability] supabase error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    const list = data ?? [];
    const nowBI = BigInt(Math.floor(Date.now() / 1000));

    // Por totem: preview de stress vía MIRROR (no inventar fórmulas)
    const stressByTotem = list.map((t) => {
      const lastPrice     = toBI(t.last_price ?? t.price ?? 0);
      const currentPrice  = toBI(t.price ?? 0);
      const lastVolume    = toBI(t.last_volume ?? t.volume_24h ?? 0);
      const currentVolume = toBI(t.volume_24h ?? 0);
      const avgReputation = toBI(t.score ?? 0);
      const lastStab      = toBI(t.last_stabilization ?? 0);

      let stress = 0n, buybackRate = Stability.BASE_BUYBACK_RATE, canStab = false, secsUnlock = 0n;
      try {
        const p = stabilizationPreview({
          lastPrice, currentPrice,
          lastVolume, currentVolume,
          avgReputation,
          lastStabilization: lastStab,
          now: nowBI,
        });
        stress      = p.stress;
        buybackRate = p.buybackRate;
        canStab     = p.canStabilize;
        secsUnlock  = p.secondsUntilUnlock;
      } catch {
        // mirror lanza solo en typecheck; ante input degenerado dejamos defaults
      }

      return {
        address:            t.address,
        stress:             Number(stress),
        buybackRate:        Number(buybackRate),
        canStabilize:       canStab,
        secondsUntilUnlock: Number(secsUnlock),
      };
    });

    // Heurística off-chain: totems sin volumen 24h y supply > 0 = "stale"
    // (NO equivale al `frozen` on-chain, ese requiere call al contrato)
    const stale = list
      .filter((t) => Number(t.supply ?? 0) > 0 && Number(t.volume_24h ?? 0) === 0)
      .map((t) => t.address);

    const highStress = stressByTotem.filter(
      (s) => s.stress >= Number(Stability.STRESS_PIECEWISE_HIGH)
    );

    const warnings = [];
    if (highStress.length > 0) warnings.push(`${highStress.length} totem(s) en stress >= ${Stability.STRESS_PIECEWISE_HIGH}n`);
    if (stale.length > 0)      warnings.push(`${stale.length} totem(s) sin volumen en 24h`);
    if (list.length === 0)     warnings.push("No hay totems registrados");

    return res.status(200).json({
      stable:        warnings.length === 0,
      stressByTotem,
      stale,
      // Aliases retro-compat con consumers anteriores que esperan `frozen`
      // (estos valores NO son el `frozen` on-chain — solo heurística off-chain)
      frozen: stale,
      warnings,
    });
  } catch (err) {
    console.error("[/api/system/stability] unhandled:", err);
    return res.status(500).json({ error: err?.message ?? "internal error" });
  }
}

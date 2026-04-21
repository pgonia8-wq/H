/**
 * AntiManipWidget.tsx — Visor advisory del estado AntiManipulation del totem
 *
 * MIRROR-ONLY: TODA la lógica viene del backend /api/system/antiManip-preview,
 * que a su vez es proxy puro de lib/antiManipulation.mjs (mirror BigInt EXACTO
 * de TotemAntiManipulationLayer.sol). El contrato SOLO tiene EMA + cooldown;
 * este widget NO inventa wash/sandwich/velocity/MEV detection. ONCHAIN WINS.
 *
 * MODO DEV:
 *   Sin contrato deployado, prev/lastUpdate son "0" → cold-start (canUpdateNow
 *   = true, nextEma = newValue). El widget rotula esto como "Sin historial
 *   on-chain" para no mentir al usuario.
 *
 * MODO PROD (cuando ANTI_MANIP_ADDRESS exista):
 *   El padre lee prevEmaWei + lastUpdateUnix vía RPC y los pasa por props.
 *   El widget no los lee él mismo (separación de responsabilidades).
 *
 * Props clave:
 *   - currentPriceWld: precio actual del totem en WLD (number, formato UI).
 *     Si es 0 / NaN, el widget muestra estado vacío.
 *   - prevEmaWei + lastUpdateUnix: opcionales, default "0" (cold-start).
 */

import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { antiManipPreview, type AntiManipPreview } from "../../../lib/tradeApi";

interface Props {
  totemAddress:    string;
  /** Precio actual del totem en WLD (UI number). Convertido a wei internamente. */
  currentPriceWld: number;
  /** emaPrice persistido en wei (bigint string). Default "0" = sin historial. */
  prevEmaWei?:     string;
  /** Unix segundos del último updateOracle. Default "0" = nunca. */
  lastUpdateUnix?: string;
  isDark?:         boolean;
}

// Convierte WLD (number) → wei (bigint string) sin pérdida de precisión
// más allá de lo que el number permite. Usa Math.floor para truncar como
// haría el contrato. NO permite negativos.
function wldToWeiString(wld: number): string {
  if (!isFinite(wld) || wld <= 0) return "0";
  // Multiplicación en number es lossy a partir de 2^53; aceptable para UI
  // advisory porque el contrato es la fuente de verdad final.
  return BigInt(Math.floor(wld * 1e18)).toString();
}

// Formato corto de duración: "2m 30s", "45s", "1h 5m"
function fmtDuration(secsStr: string): string {
  const s = Number(secsStr);
  if (!isFinite(s) || s <= 0) return "0s";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

// Formato compacto WLD desde wei string. Para UI advisory; el contrato decide.
function fmtWldFromWei(weiStr: string): string {
  try {
    const wei = BigInt(weiStr);
    if (wei === 0n) return "—";
    // Divide preservando 6 decimales (suficiente para mostrar)
    const whole = wei / 10n ** 18n;
    const frac  = wei % 10n ** 18n;
    const fracStr = (frac / 10n ** 12n).toString().padStart(6, "0").replace(/0+$/, "");
    if (whole === 0n && fracStr === "") return "<0.000001";
    return fracStr ? `${whole}.${fracStr}` : whole.toString();
  } catch {
    return "—";
  }
}

export default function AntiManipWidget({
  totemAddress,
  currentPriceWld,
  prevEmaWei     = "0",
  lastUpdateUnix = "0",
  isDark         = true,
}: Props) {
  const [data,    setData]    = useState<AntiManipPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Skip llamada si no hay precio observable
  const newValueWei = wldToWeiString(currentPriceWld);
  const skip = newValueWei === "0";

  useEffect(() => {
    if (skip) { setData(null); setError(null); return; }

    let alive = true;
    setLoading(true);
    setError(null);
    antiManipPreview({
      prev:       prevEmaWei,
      newValue:   newValueWei,
      lastUpdate: lastUpdateUnix,
    })
      .then((res) => { if (alive) setData(res); })
      .catch((e) => { if (alive) setError(e?.message ?? "Error consultando AntiManip"); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
    // totemAddress en deps por trazabilidad UI, aunque no entra al request
  }, [totemAddress, prevEmaWei, lastUpdateUnix, newValueWei, skip]);

  // ── Estilos coherentes con TradePanel/TotemDashboard ─────────────────────
  const bg       = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const border   = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";
  const txt      = isDark ? "#f3f4f6" : "#111113";
  const txtSub   = isDark ? "rgba(243,244,246,0.65)" : "rgba(17,17,19,0.65)";
  const txtMuted = isDark ? "rgba(243,244,246,0.42)" : "rgba(17,17,19,0.42)";
  const okColor  = "#22c55e";
  const warnCol  = "#fbbf24";
  const errCol   = "#f87171";

  // ── Render ───────────────────────────────────────────────────────────────
  if (skip) {
    return (
      <div style={{
        background: bg, border, borderRadius: 14, padding: "10px 12px",
        marginBottom: 14, fontSize: 11, color: txtMuted, lineHeight: 1.55,
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: txtSub, fontWeight: 600 }}>
          <Activity size={12} /> AntiManipulation
        </div>
        <div style={{ marginTop: 4 }}>Sin precio observable todavía</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: bg, border, borderRadius: 14, padding: "10px 12px",
        marginBottom: 14, fontSize: 11, color: errCol,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <AlertTriangle size={12} /> {error}
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={{
        background: bg, border, borderRadius: 14, padding: "10px 12px",
        marginBottom: 14, fontSize: 11, color: txtSub,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <Loader2 size={12} className="tp-spin" /> Consultando AntiManip…
      </div>
    );
  }

  const isColdStart  = data.inputs.prev === "0";
  const statusColor  = data.canUpdateNow ? okColor : warnCol;
  const statusIcon   = data.canUpdateNow
    ? <ShieldCheck size={12} />
    : <Activity    size={12} />;
  const statusText   = data.canUpdateNow
    ? "Listo para actualizar EMA"
    : `Cooldown · ${fmtDuration(data.secondsUntilUnlock)}`;

  // ALPHA viene como bigint string ("20"). Mostrar como porcentaje
  // sobre ALPHA_DENOMINATOR ("100") = 20%.
  const alphaPct = Math.round(
    (Number(data.constants.ALPHA) / Number(data.constants.ALPHA_DENOMINATOR)) * 100,
  );
  const cooldownMin = Math.round(Number(data.constants.MIN_INTERVAL_SEC) / 60);

  return (
    <div style={{
      background: bg, border, borderRadius: 14, padding: "10px 12px",
      marginBottom: 14, fontSize: 11, lineHeight: 1.55,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: txtSub, fontWeight: 700, letterSpacing: -0.1,
        }}>
          <Activity size={12} /> AntiManipulation
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          color: statusColor, fontWeight: 700, fontSize: 10.5,
        }}>
          {statusIcon} {statusText}
        </div>
      </div>

      {/* Filas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 4, columnGap: 12 }}>
        <span style={{ color: txtMuted }}>EMA actual</span>
        <span style={{ color: txt, fontVariantNumeric: "tabular-nums" }}>
          {isColdStart ? "Sin historial on-chain" : `${fmtWldFromWei(data.inputs.prev)} WLD`}
        </span>

        <span style={{ color: txtMuted }}>EMA siguiente (preview)</span>
        <span style={{ color: txt, fontVariantNumeric: "tabular-nums" }}>
          {fmtWldFromWei(data.nextEma)} WLD
        </span>

        <span style={{ color: txtMuted }}>Observación nueva</span>
        <span style={{ color: txt, fontVariantNumeric: "tabular-nums" }}>
          {fmtWldFromWei(data.inputs.newValue)} WLD
        </span>
      </div>

      {/* Footer constantes on-chain */}
      <div style={{
        marginTop: 8, paddingTop: 8,
        borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
        fontSize: 9.5, color: txtMuted, fontStyle: "italic",
      }}>
        Smoothing α={alphaPct}% · cooldown {cooldownMin}min · advisory · el contrato decide
      </div>
    </div>
  );
}

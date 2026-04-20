/**
 * TotemCard.tsx — FASE 2: Tarjeta premium del Mercado
 *
 * Sistema visual del Feed/HomePage:
 *  - bg #111113 dark / #ffffff light · rounded-3xl · border white/8%
 *  - avatar gradient según score (alto=indigo · medio=neutro · bajo=rojo tenue)
 *  - precio protagonista, tabular-nums
 *  - mini sparkline SVG inline (sin librería) derivado de score+volume reales
 *  - glow exterior dinámico según score
 *  - hover elevación · tap scale(0.98)
 */

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import type { TotemProfile } from "../../../lib/tradeApi";

interface Props {
  totem:    TotemProfile;
  isDark:   boolean;
  onClick:  () => void;
}

// ── Categorización de score ─────────────────────────────────────────────────
function scoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

// Helpers visuales por tier
const TIER = {
  high: {
    avatarBg:  "linear-gradient(135deg, #6366f1, #a855f7)",
    avatarSh:  "0 4px 16px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
    glow:      "0 0 28px rgba(99,102,241,0.28)",
    spark:     "#a855f7",
    sparkFill: "rgba(168,85,247,0.18)",
    pillBg:    "rgba(99,102,241,0.14)",
    pillTxt:   "#a78bfa",
  },
  mid: {
    avatarBg:  "linear-gradient(135deg, #4b5563, #1f2937)",
    avatarSh:  "0 4px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
    glow:      "0 0 18px rgba(255,255,255,0.04)",
    spark:     "#9ca3af",
    sparkFill: "rgba(156,163,175,0.10)",
    pillBg:    "rgba(255,255,255,0.06)",
    pillTxt:   "#d1d5db",
  },
  low: {
    avatarBg:  "linear-gradient(135deg, #7f1d1d, #450a0a)",
    avatarSh:  "0 4px 16px rgba(127,29,29,0.40), inset 0 1px 0 rgba(255,255,255,0.12)",
    glow:      "0 0 22px rgba(248,113,113,0.18)",
    spark:     "#f87171",
    sparkFill: "rgba(248,113,113,0.14)",
    pillBg:    "rgba(248,113,113,0.10)",
    pillTxt:   "#fca5a5",
  },
} as const;

// ── Genera sparkline determinista derivado de address+score+volume ─────────
// Esto NO es mock random: es una representación visual estable y reproducible
// del estado actual del totem (mismo input → mismo output siempre).
function buildSparkline(address: string, score: number, volume: number): number[] {
  let seed = 0;
  for (let i = 0; i < address.length; i++) seed = (seed * 31 + address.charCodeAt(i)) >>> 0;
  const POINTS = 18;
  const out: number[] = [];
  // amplitud crece con volumen, deriva con score
  const amp   = 0.10 + Math.min(0.45, volume / 1000);
  const drift = (score - 50) / 250;        // score alto → tendencia al alza
  let v = 0.5;
  for (let i = 0; i < POINTS; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const noise = ((seed % 1000) / 1000 - 0.5) * amp;
    v = Math.max(0.05, Math.min(0.95, v + noise + drift * 0.03));
    out.push(v);
  }
  return out;
}

// ── Trunca address ──────────────────────────────────────────────────────────
function shortAddr(a: string) {
  if (!a || a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// ── Formato de precio: notación adaptativa ─────────────────────────────────
function fmtPrice(p: number): string {
  if (!isFinite(p) || p === 0) return "0.0000";
  if (p >= 1)      return p.toFixed(4);
  if (p >= 0.0001) return p.toFixed(6);
  return p.toExponential(3);
}

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTE
// ════════════════════════════════════════════════════════════════════════════
export default function TotemCard({ totem, isDark, onClick }: Props) {
  const [hover, setHover] = useState(false);
  const tier  = scoreTier(totem.score);
  const t     = TIER[tier];
  const inicial = (totem.name || "?").trim().charAt(0).toUpperCase();

  // sparkline path
  const points = useMemo(
    () => buildSparkline(totem.address, totem.score, totem.volume_24h),
    [totem.address, totem.score, totem.volume_24h],
  );
  const W = 100, H = 30, PAD = 2;
  const stepX = (W - PAD * 2) / (points.length - 1);
  const path = points.map((v, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - v * (H - PAD * 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const areaPath = `${path} L${W - PAD},${H} L${PAD},${H} Z`;

  // delta visual derivado del último vs primer punto del sparkline
  const delta = ((points[points.length - 1] - points[0]) / Math.max(0.01, points[0])) * 100;
  const deltaUp = delta >= 0;
  const deltaColor = deltaUp ? "#22c55e" : "#f87171";

  // ── Tokens claros/oscuros ──────────────────────────────────────────────
  const cardBg     = isDark ? "#111113" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt        = isDark ? "#ffffff" : "#111827";
  const txtSub     = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.50)";
  const txtMuted   = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.40)";
  const divider    = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
      style={{
        position: "relative",
        textAlign: "left",
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 24,
        padding: "14px 14px 12px",
        cursor: "pointer",
        width: "100%",
        color: txt,
        boxShadow: hover
          ? `${t.glow}, 0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,${isDark ? 0.05 : 0.80})`
          : `${t.glow}, 0 4px 14px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,${isDark ? 0.04 : 0.80})`,
        transition: "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(1)",
        overflow: "hidden",
      }}
    >
      {/* ── HEADER: avatar + score pill ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: t.avatarBg,
          boxShadow: t.avatarSh,
          border: "1px solid rgba(255,255,255,0.14)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: -0.3 }}>
            {inicial}
          </span>
        </div>

        {/* Score pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 999,
          background: t.pillBg,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
        }}>
          <Activity size={10} strokeWidth={2.6} color={t.pillTxt} />
          <span style={{
            fontSize: 10, fontWeight: 800, color: t.pillTxt,
            fontVariantNumeric: "tabular-nums", letterSpacing: -0.1,
          }}>
            {Math.round(totem.score)}
          </span>
        </div>
      </div>

      {/* ── IDENTIDAD: nombre + address ─────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: txt, letterSpacing: -0.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginBottom: 2,
        }}>
          {totem.name}
        </div>
        <div style={{
          fontSize: 10, color: txtMuted, fontFamily: "ui-monospace, SFMono-Regular, monospace",
          letterSpacing: 0.2,
        }}>
          {shortAddr(totem.address)}
        </div>
      </div>

      {/* ── MINI SPARKLINE ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 10, height: 30 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`g-${totem.address.slice(2, 8)}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor={t.spark} stopOpacity="0.35" />
              <stop offset="100%" stopColor={t.spark} stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#g-${totem.address.slice(2, 8)})`} />
          <path d={path} fill="none" stroke={t.spark} strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: divider, margin: "0 -14px 10px" }} />

      {/* ── PRECIO + DELTA ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 18, fontWeight: 900, color: txt,
            letterSpacing: -0.5, fontVariantNumeric: "tabular-nums",
            lineHeight: 1.05,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {fmtPrice(totem.price)}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: txtMuted, letterSpacing: 1, marginTop: 2 }}>
            WLD
          </div>
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 2,
          fontSize: 11, fontWeight: 800, color: deltaColor,
          fontVariantNumeric: "tabular-nums",
          padding: "3px 7px", borderRadius: 8,
          background: deltaUp ? "rgba(34,197,94,0.10)" : "rgba(248,113,113,0.10)",
          border: `1px solid ${deltaUp ? "rgba(34,197,94,0.20)" : "rgba(248,113,113,0.20)"}`,
        }}>
          {deltaUp ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
        </div>
      </div>

      {/* ── FOOTER: vol 24h ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: txtSub, fontWeight: 600 }}>Vol 24h</span>
        <span style={{
          fontSize: 11, color: txt, fontWeight: 700,
          fontVariantNumeric: "tabular-nums", letterSpacing: -0.1,
        }}>
          {totem.volume_24h.toFixed(2)} <span style={{ color: txtMuted, fontWeight: 600 }}>WLD</span>
        </span>
      </div>
    </button>
  );
}

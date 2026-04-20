/**
 * PriceChart.tsx — FASE 3: Gráfico de precio profesional (trading-grade)
 *
 * Sistema visual H by Humans:
 *  - área gradient indigo (rgba(99,102,241,*) top→bottom)
 *  - línea principal #6366f1 + capa de glow (stroke 7, opacity 0.10)
 *  - tooltip glass custom: bg rgba(20,20,20,0.92) + blur + border white/10%
 *  - crosshair vertical tenue rgba(255,255,255,0.16)
 *  - punto activo con halo
 *  - sin estilos default de recharts, sin grid duro
 */

import { memo, useId, useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, Line,
  XAxis, YAxis, Tooltip, type TooltipProps,
} from "recharts";

// ── Props ───────────────────────────────────────────────────────────────────
export interface PricePoint {
  time:  number | string;
  price: number;
}

interface Props {
  data:    PricePoint[];
  isDark:  boolean;
  height?: number;
}

// ── Format helpers ──────────────────────────────────────────────────────────
function fmtPrice(p: number): string {
  if (!isFinite(p) || p === 0) return "0.0000";
  if (p >= 1)      return p.toFixed(4);
  if (p >= 0.0001) return p.toFixed(6);
  return p.toExponential(3);
}

function fmtTime(t: number | string): string {
  const d = typeof t === "number" ? new Date(t) : new Date(t);
  if (isNaN(d.getTime())) return String(t);
  const day  = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  const hour = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${hour}`;
}

// ════════════════════════════════════════════════════════════════════════════
//  TOOLTIP CUSTOM (glass premium)
// ════════════════════════════════════════════════════════════════════════════
function GlassTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const p   = payload[0]?.payload as PricePoint | undefined;
  if (!p) return null;
  const val = typeof p.price === "number" ? p.price : 0;

  return (
    <div
      style={{
        background:        "rgba(20,20,20,0.92)",
        backdropFilter:    "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        border:            "1px solid rgba(255,255,255,0.10)",
        borderRadius:      14,
        padding:           "10px 14px",
        boxShadow:         "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        minWidth:          120,
        pointerEvents:     "none",
      }}
    >
      <div
        style={{
          fontSize:     17,
          fontWeight:   900,
          color:        "#ffffff",
          letterSpacing: -0.4,
          fontVariantNumeric: "tabular-nums",
          lineHeight:   1.1,
          marginBottom: 4,
        }}
      >
        {fmtPrice(val)}{" "}
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>
          WLD
        </span>
      </div>
      <div
        style={{
          fontSize:    10.5,
          color:       "rgba(255,255,255,0.55)",
          fontWeight:  600,
          letterSpacing: 0.1,
        }}
      >
        {fmtTime(p.time)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ACTIVE DOT con halo (custom)
// ════════════════════════════════════════════════════════════════════════════
function ActiveDot(props: { cx?: number; cy?: number }) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g style={{ pointerEvents: "none" }}>
      {/* halo exterior */}
      <circle cx={cx} cy={cy} r={10} fill="rgba(99,102,241,0.18)" />
      <circle cx={cx} cy={cy} r={6}  fill="rgba(99,102,241,0.35)" />
      {/* núcleo */}
      <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" stroke="#6366f1" strokeWidth={2} />
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTE
// ════════════════════════════════════════════════════════════════════════════
function PriceChartImpl({ data, isDark, height = 240 }: Props) {
  const uid = useId().replace(/[:]/g, "");
  const idArea  = `pcArea-${uid}`;

  // Normalizamos data → asegura keys consistentes para recharts
  const series = useMemo(
    () => (data ?? []).map((d) => ({
      time:  d.time,
      price: typeof d.price === "number" && isFinite(d.price) ? d.price : 0,
    })),
    [data],
  );

  // Padding del dominio Y para que la línea no roce los bordes
  const yDomain = useMemo<[number, number]>(() => {
    if (series.length === 0) return [0, 1];
    let min = Infinity, max = -Infinity;
    for (const p of series) { if (p.price < min) min = p.price; if (p.price > max) max = p.price; }
    if (!isFinite(min) || !isFinite(max)) return [0, 1];
    if (min === max) { const pad = Math.abs(min) * 0.10 || 1; return [min - pad, max + pad]; }
    const pad = (max - min) * 0.18;
    return [min - pad, max + pad];
  }, [series]);

  const axisColor = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.30)";

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 14, right: 8, left: 8, bottom: 4 }}
        >
          <defs>
            {/* gradient vertical del área */}
            <linearGradient id={idArea} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="55%"  stopColor="#6366f1" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            hide
            type="category"
          />
          <YAxis
            domain={yDomain}
            hide
          />

          {/* área gradient (sin stroke; la línea va aparte) */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="none"
            fill={`url(#${idArea})`}
            isAnimationActive={false}
            activeDot={false}
          />

          {/* GLOW: línea ancha de baja opacidad bajo la principal */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeOpacity={0.10}
            strokeWidth={7}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* LÍNEA PRINCIPAL */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={<ActiveDot />}
            isAnimationActive={false}
          />

          <Tooltip
            content={<GlassTooltip />}
            cursor={{
              stroke: axisColor,
              strokeWidth: 1,
              strokeDasharray: "3 4",
            }}
            wrapperStyle={{ outline: "none", zIndex: 30 }}
            offset={14}
            allowEscapeViewBox={{ x: false, y: true }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Empty state visual cuando data está vacía */}
      {series.length === 0 && (
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)",
            fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
            pointerEvents: "none",
          }}
        >
          Sin datos de precio aún
        </div>
      )}
    </div>
  );
}

// memo para evitar rerender cuando data referencialmente no cambia
const PriceChart = memo(PriceChartImpl, (prev, next) =>
  prev.data === next.data && prev.isDark === next.isDark && prev.height === next.height,
);

export default PriceChart;

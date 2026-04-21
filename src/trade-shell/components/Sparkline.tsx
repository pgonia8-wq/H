/**
 * Sparkline — Chart SVG minimalista sobre TotemHistory.
 * Verde si pendiente ≥0, rojo si <0. Sin deps extra.
 */
import { useMemo } from "react";
import type { TotemHistory } from "../../lib/tradeApi";

interface Props {
  data:    TotemHistory[];
  height?: number;
  width?:  number;
}

export default function Sparkline({ data, height = 120, width = 320 }: Props) {
  const { path, area, up, minP, maxP } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: "", area: "", up: true, minP: 0, maxP: 0 };
    }
    const ps = data.map(d => d.price).filter(n => Number.isFinite(n));
    if (ps.length < 2) return { path: "", area: "", up: true, minP: 0, maxP: 0 };
    const min = Math.min(...ps);
    const max = Math.max(...ps);
    const range = max - min || max || 1;
    const step = width / (ps.length - 1);
    const ys = ps.map(p => height - ((p - min) / range) * (height - 8) - 4);
    const pts = ys.map((y, i) => `${i * step},${y}`);
    const line = "M " + pts.join(" L ");
    const fill = `${line} L ${width},${height} L 0,${height} Z`;
    return { path: line, area: fill, up: ps[ps.length - 1] >= ps[0], minP: min, maxP: max };
  }, [data, width, height]);

  const stroke = up ? "#22c55e" : "#f87171";
  const fill   = up ? "rgba(34,197,94,0.18)" : "rgba(248,113,113,0.18)";

  if (!path) {
    return (
      <div
        className="w-full flex items-center justify-center rounded-xl text-xs"
        style={{ height, color: "rgba(255,255,255,0.35)", border: "1px dashed rgba(255,255,255,0.08)" }}
      >
        Sin historial
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={4}         y={12}          fontSize={9} fill="rgba(255,255,255,0.35)">{maxP.toFixed(6)}</text>
      <text x={4}         y={height - 4}  fontSize={9} fill="rgba(255,255,255,0.35)">{minP.toFixed(6)}</text>
    </svg>
  );
}

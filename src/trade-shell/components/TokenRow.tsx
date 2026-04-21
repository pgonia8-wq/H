/**
 * TokenRow — Fila de la lista de mercado. Clonado de token/TokenCard pero
 * horizontal/compacto y adaptado a TotemProfile.
 */
import { motion } from "framer-motion";
import type { Enriched } from "../services/derive";
import { formatUsd, formatWld } from "../services/derive";

interface Props {
  t: Enriched;
  onClick: (address: string) => void;
  index?: number;
}

export default function TokenRow({ t, onClick, index = 0 }: Props) {
  const levelColor =
    t.level >= 4 ? "#a78bfa" :
    t.level >= 3 ? "#22c55e" :
    t.level >= 2 ? "#fbbf24" :
                   "rgba(255,255,255,0.55)";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(t.address)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl shrink-0"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(167,139,250,0.18))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {t.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold truncate">{t.name}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{
            background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)",
          }}>{t.symbol}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px]">
          <span style={{ color: levelColor }}>L{t.level} · {t.badge || "—"}</span>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>Vol {formatWld(t.volume_24h, 2)}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-white font-semibold tabular-nums">{formatUsd(t.price, 6)}</div>
        <div className="text-[11px] tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>
          Score {Math.round(t.score)}
        </div>
      </div>
    </motion.button>
  );
}

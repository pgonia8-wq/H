/**
 * MarketPage.tsx — FASE 2: Mercado premium con search, filter chips,
 *                  grid 2-col mobile, skeletons shimmer y empty state elegante.
 *
 * Data source: getAllTotems() / searchTotems() de tradeApi.ts
 *              → llama a /api/system/all y /api/system/search
 *              Si el endpoint no responde → empty state (NO mock data).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, BarChart2, DollarSign, Activity, Layers, Inbox, AlertTriangle, RotateCw } from "lucide-react";
import {
  getAllTotems, searchTotems,
  type TotemProfile,
} from "../../lib/tradeApi";
import TotemCard from "./components/TotemCard";
import PriceChart, { type PricePoint } from "./components/PriceChart";

// ── DEBUG: data realista para validar integración del PriceChart ───────────
//   48 puntos horarios (24h × 2). Curva coherente con tendencia leve al alza,
//   sin ruido absurdo. Determinista (mismo array en cada render).
//   Eliminar este bloque cuando TotemDashboard (Fase 4) consuma data real.
const DEBUG_PRICE_DATA: PricePoint[] = (() => {
  const out: PricePoint[] = [];
  const now   = Date.now();
  const HOUR  = 3600_000;
  let price   = 0.000128;
  const drift = 0.0000004;          // tendencia suave alcista
  // micro-oscilaciones sinusoidales (dos frecuencias) → curva orgánica
  for (let i = 47; i >= 0; i--) {
    const t   = now - i * (HOUR / 2);
    const wave1 = Math.sin(i * 0.42) * 0.0000055;
    const wave2 = Math.cos(i * 0.18) * 0.0000028;
    out.push({ time: t, price: Math.max(0.00001, price + wave1 + wave2) });
    price += drift;
  }
  return out;
})();

// ── Tipos ───────────────────────────────────────────────────────────────────
interface Props {
  isDark:        boolean;
  onSelectTotem: (address: string) => void;
}

type SortKey = "volume" | "price" | "score" | "supply";

const SORTS: { key: SortKey; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }> }[] = [
  { key: "volume", label: "Volumen", icon: BarChart2 },
  { key: "price",  label: "Precio",  icon: DollarSign },
  { key: "score",  label: "Score",   icon: Activity   },
  { key: "supply", label: "Supply",  icon: Layers     },
];

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTE
// ════════════════════════════════════════════════════════════════════════════
export default function MarketPage({ isDark, onSelectTotem }: Props) {
  const [totems,    setTotems]    = useState<TotemProfile[]>([]);
  const [loading,   setLoading]   = useState(true);  // ← solo true en 1ra carga
  const [updating,  setUpdating]  = useState(false); // ← refresh con data presente
  const [error,     setError]     = useState(false);
  const [query,     setQuery]     = useState("");
  const [sort,      setSort]      = useState<SortKey>("volume");
  const [searchFocus, setSearchFocus] = useState(false);

  // ── Token de petición: descarta respuestas stale (race condition) ──────
  const reqIdRef    = useRef(0);
  // ── Snapshot del último count para decidir si mostrar skeleton ─────────
  const hasDataRef  = useRef(false);

  // ── Tokens visuales del sistema ────────────────────────────────────────
  const txt      = isDark ? "#ffffff" : "#111827";
  const txtSub   = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
  const txtMuted = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)";

  // ── Carga (sort/retry/restore). Solo muestra skeleton si NO hay data. ──
  const loadAll = useCallback(async () => {
    const myId = ++reqIdRef.current;
    setError(false);
    if (!hasDataRef.current) setLoading(true);        // skeleton solo en 1ra carga
    else                     setUpdating(true);       // fade leve si hay data
    try {
      const list = await getAllTotems(sort);
      if (myId !== reqIdRef.current) return;          // respuesta stale → descartar
      const safe = Array.isArray(list) ? list : [];
      hasDataRef.current = safe.length > 0;
      setTotems(safe);
    } catch {
      if (myId !== reqIdRef.current) return;
      hasDataRef.current = false;
      setTotems([]); setError(true);
    } finally {
      if (myId === reqIdRef.current) { setLoading(false); setUpdating(false); }
    }
  }, [sort]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Búsqueda con debounce 300ms + token anti-stale ─────────────────────
  useEffect(() => {
    if (query.trim().length < 2) {
      if (query === "") loadAll();                    // restaurar lista completa
      return;
    }
    const t = setTimeout(async () => {
      const myId = ++reqIdRef.current;
      setError(false);
      // fade leve si ya hay grid; skeleton solo si está vacío
      if (hasDataRef.current) setUpdating(true);
      else                    setLoading(true);
      try {
        const list = await searchTotems(query.trim());
        if (myId !== reqIdRef.current) return;        // descartar respuesta vieja
        const safe = Array.isArray(list) ? list : [];
        hasDataRef.current = safe.length > 0;
        setTotems(safe);
      } catch {
        if (myId !== reqIdRef.current) return;
        hasDataRef.current = false;
        setTotems([]); setError(true);
      } finally {
        if (myId === reqIdRef.current) { setLoading(false); setUpdating(false); }
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, loadAll]);

  return (
    <div style={{ paddingBottom: 24 }}>
      <style>{KEYFRAMES_MARKET}</style>

      {/* ─── TOP BAR: search ────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        marginBottom: 12,
      }}>
        {/* halo focus */}
        {searchFocus && (
          <div style={{
            position: "absolute", inset: -3, borderRadius: 18,
            background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.30), transparent 70%)",
            filter: "blur(10px)", pointerEvents: "none",
            transition: "opacity 200ms ease",
          }} />
        )}
        <div style={{
          position: "relative",
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px",
          borderRadius: 16,
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          border: searchFocus
            ? "1px solid rgba(99,102,241,0.45)"
            : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.30)"
            : "inset 0 1px 0 rgba(255,255,255,0.80), 0 2px 10px rgba(0,0,0,0.04)",
          transition: "border-color 200ms ease",
        }}>
          <Search size={16} strokeWidth={2.4} color={searchFocus ? "#a78bfa" : txtSub} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Buscar totem..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: txt, fontSize: 14, fontWeight: 500,
              letterSpacing: -0.1,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                border: "none", borderRadius: 8,
                width: 22, height: 22, display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={12} strokeWidth={2.6} color={txtSub} />
            </button>
          )}
        </div>
      </div>

      {/* ─── FILTER CHIPS ───────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
        overflowX: "auto", overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 4,
        scrollbarWidth: "none",
      }}>
        {SORTS.map(({ key, label, icon: Icon }) => {
          const active = sort === key;
          return (
            <button
              key={key}
              onClick={() => setSort(key)}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e)=> (e.currentTarget.style.transform = "scale(1)")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 14px",
                borderRadius: 999,
                border: active
                  ? "1px solid rgba(255,255,255,0.18)"
                  : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                background: active
                  ? "linear-gradient(135deg, #6366f1, #a855f7)"
                  : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                boxShadow: active
                  ? "0 4px 20px rgba(99,102,241,0.40), inset 0 1px 0 rgba(255,255,255,0.20)"
                  : "none",
                color: active ? "#ffffff" : txtSub,
                fontSize: 12, fontWeight: 700, letterSpacing: -0.1,
                cursor: "pointer", flexShrink: 0,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Icon size={12} strokeWidth={2.6} color={active ? "#ffffff" : txtSub} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ─── DEBUG PREVIEW PriceChart (solo dev) ────────────────────────── */}
      {import.meta.env.DEV && (
        <div style={{
          marginBottom: 16,
          padding: "14px 14px 8px",
          borderRadius: 24,
          background: isDark ? "#111113" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark
            ? "0 8px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 4px 14px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Header del card: identidad + precio actual */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.50)",
                textTransform: "uppercase", marginBottom: 2,
              }}>
                Debug · Price 24h
              </div>
              <div style={{
                fontSize: 22, fontWeight: 900, letterSpacing: -0.5,
                color: isDark ? "#ffffff" : "#111827",
                fontVariantNumeric: "tabular-nums", lineHeight: 1.05,
              }}>
                {DEBUG_PRICE_DATA[DEBUG_PRICE_DATA.length - 1].price.toFixed(6)}{" "}
                <span style={{ fontSize: 11, fontWeight: 700, color: txtMuted, letterSpacing: 1 }}>WLD</span>
              </div>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 11, fontWeight: 800,
              color: "#22c55e",
              padding: "4px 8px", borderRadius: 8,
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.20)",
              fontVariantNumeric: "tabular-nums",
            }}>
              ↑ {(((DEBUG_PRICE_DATA[DEBUG_PRICE_DATA.length - 1].price - DEBUG_PRICE_DATA[0].price)
                  / DEBUG_PRICE_DATA[0].price) * 100).toFixed(2)}%
            </div>
          </div>
          <PriceChart data={DEBUG_PRICE_DATA} isDark={isDark} height={200} />
        </div>
      )}

      {/* ─── 3 ESTADOS EXPLÍCITOS: LOADING · ERROR · EMPTY · SUCCESS ───── */}
      {loading ? (
        <SkeletonGrid isDark={isDark} />
      ) : error ? (
        <ErrorState isDark={isDark} onRetry={loadAll} />
      ) : totems.length === 0 ? (
        <EmptyState
          isDark={isDark}
          query={query}
          onClear={() => { setQuery(""); loadAll(); }}
        />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          animation: "marketFadeUp 320ms cubic-bezier(0.4, 0, 0.2, 1) both",
          opacity: updating ? 0.55 : 1,
          transition: "opacity 200ms ease",
          pointerEvents: updating ? "none" : "auto",   // evita taps durante refresh
        }}>
          {totems.map((t) => (
            <TotemCard
              key={t.address}
              totem={t}
              isDark={isDark}
              onClick={() => onSelectTotem(t.address)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SKELETON SHIMMER (no spinner)
// ════════════════════════════════════════════════════════════════════════════
function SkeletonGrid({ isDark }: { isDark: boolean }) {
  const cardBg     = isDark ? "#111113" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const shimmerBg  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 12,
    }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 24,
          padding: "14px 14px 12px",
          minHeight: 188,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* shimmer overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, transparent, ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}, transparent)`,
            animation: "marketShimmer 1.4s ease-in-out infinite",
          }} />
          {/* placeholders */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: shimmerBg }} />
            <div style={{ width: 38, height: 16, borderRadius: 999, background: shimmerBg }} />
          </div>
          <div style={{ width: "70%", height: 14, borderRadius: 6, background: shimmerBg, marginBottom: 6 }} />
          <div style={{ width: "45%", height: 10, borderRadius: 5, background: shimmerBg, marginBottom: 12 }} />
          <div style={{ width: "100%", height: 30, borderRadius: 6, background: shimmerBg, marginBottom: 12 }} />
          <div style={{ width: "55%", height: 18, borderRadius: 6, background: shimmerBg }} />
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  EMPTY STATE — solo "no hay datos" (mercado vacío o sin resultados)
//  El error se maneja en ErrorState (componente separado).
// ════════════════════════════════════════════════════════════════════════════
function EmptyState({
  isDark, query, onClear,
}: { isDark: boolean; query: string; onClear: () => void }) {
  const txt    = isDark ? "#ffffff" : "#111827";
  const txtSub = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";

  const isSearch = query.trim().length >= 2;

  const title    = isSearch ? `Sin resultados para "${query}"` : "Mercado vacío";
  const subtitle = isSearch
    ? "Probá con otro término o limpiá la búsqueda."
    : "Aún no hay Totems listados. Sé el primero en crear uno.";

  return (
    <div style={{
      minHeight: "44vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "32px 20px",
      animation: "marketFadeUp 380ms cubic-bezier(0.4, 0, 0.2, 1) both",
    }}>
      <div style={{
        position: "relative", width: 96, height: 96, marginBottom: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 65%)",
          filter: "blur(18px)",
          animation: "marketPulse 3.2s ease-in-out infinite",
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(160deg, #2c2c2c 0%, #1a1a1a 45%, #0f0f0f 100%)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}>
          <Inbox size={34} color="#fff" strokeWidth={2.2} />
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 900, color: txt, letterSpacing: -0.4, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: txtSub, lineHeight: 1.55, maxWidth: 280, marginBottom: isSearch ? 18 : 0 }}>
        {subtitle}
      </p>

      {isSearch && (
        <button
          onClick={onClear}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e)=> (e.currentTarget.style.transform = "scale(1)")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff", fontSize: 13, fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.40), inset 0 1px 0 rgba(255,255,255,0.22)",
            transition: "transform 160ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          Limpiar búsqueda
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ERROR STATE — fallo de API (red/server). Botón Reintentar obligatorio.
// ════════════════════════════════════════════════════════════════════════════
function ErrorState({ isDark, onRetry }: { isDark: boolean; onRetry: () => void }) {
  const txt    = isDark ? "#ffffff" : "#111827";
  const txtSub = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        minHeight: "44vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "32px 20px",
        animation: "marketFadeUp 380ms cubic-bezier(0.4, 0, 0.2, 1) both",
      }}
    >
      {/* Icono warning con halo rojo tenue */}
      <div style={{
        position: "relative", width: 96, height: 96, marginBottom: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(248,113,113,0.26), transparent 65%)",
          filter: "blur(18px)",
          animation: "marketPulse 3.2s ease-in-out infinite",
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #7f1d1d, #450a0a)",
          boxShadow: "0 12px 40px rgba(127,29,29,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
          border: "1px solid rgba(248,113,113,0.30)",
        }}>
          <AlertTriangle size={34} color="#fff" strokeWidth={2.2} />
        </div>
      </div>

      <h3 style={{
        fontSize: 18, fontWeight: 900, color: txt, letterSpacing: -0.4, marginBottom: 6,
      }}>
        No se pudo cargar el mercado
      </h3>
      <p style={{ fontSize: 13, color: txtSub, lineHeight: 1.55, maxWidth: 280, marginBottom: 18 }}>
        Hubo un problema al conectar con el servidor. Intenta nuevamente.
      </p>

      <button
        onClick={onRetry}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e)=> (e.currentTarget.style.transform = "scale(1)")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "11px 20px", borderRadius: 14,
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff", fontSize: 13, fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(99,102,241,0.40), inset 0 1px 0 rgba(255,255,255,0.22)",
          transition: "transform 160ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <RotateCw size={14} strokeWidth={2.6} />
        Reintentar
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  KEYFRAMES
// ════════════════════════════════════════════════════════════════════════════
const KEYFRAMES_MARKET = `
  @keyframes marketShimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes marketFadeUp {
    from { transform: translateY(8px); opacity: 0; }
    to   { transform: translateY(0);   opacity: 1; }
  }
  @keyframes marketPulse {
    0%, 100% { opacity: 0.60; transform: scale(1); }
    50%      { opacity: 1.00; transform: scale(1.04); }
  }
`;

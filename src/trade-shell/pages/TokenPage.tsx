/**
 * TokenPage — Bloomberg fullscreen de un tótem.
 * Reusa BuySellFullscreen existente (MiniKit + TradePanel intactos).
 * ONCHAIN WINS: solo lectura + disparo buy/sell que SOLO firma con wallet.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, DollarSign, Users, Clock } from "lucide-react";
import {
  getTotemProfile, getTotemHistory, getTotemTrades, getTotemHolders,
} from "../../lib/tradeApi";
import type {
  TotemProfile, TotemHistory, TotemTrade, TotemHoldersResult,
} from "../../lib/tradeApi";
import { enrich, formatUsd, formatWld, formatCount, shortAddr } from "../services/derive";
import Sparkline from "../components/Sparkline";
import Stat from "../components/Stat";
import { useShell } from "../context/ShellContext";
import OrbGateModal from "../components/OrbGateModal";

// BuySellFullscreen → TradePanel → CURVE_ABI + MiniKit: pesado. Se baja solo
// cuando el usuario toca Comprar/Vender, nunca en la carga inicial del tótem.
const BuySellFullscreen = lazy(() => import("../../pages/trade/components/BuySellFullscreen"));

type Tab = "trades" | "holders";

export default function TokenPage() {
  const {
    selectedAddress, userId, walletAddress, isOrbVerified, verifyOrb, onOrbVerifiedChange, closeToken,
  } = useShell();

  const [profile,  setProfile]  = useState<TotemProfile | null>(null);
  const [history,  setHistory]  = useState<TotemHistory[]>([]);
  const [trades,   setTrades]   = useState<TotemTrade[]>([]);
  const [holders,  setHolders]  = useState<TotemHoldersResult | null>(null);
  const [tab,      setTab]      = useState<Tab>("trades");
  const [side,     setSide]     = useState<"buy" | "sell" | null>(null);
  const [orbGate,  setOrbGate]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAddress) return;
    setLoading(true); setErr(null);
    try {
      const [p, h, tr, ho] = await Promise.all([
        getTotemProfile(selectedAddress, userId || undefined),
        getTotemHistory(selectedAddress, 48).catch(() => []),
        getTotemTrades(selectedAddress, 40).catch(() => []),
        getTotemHolders(selectedAddress, 20).catch(() => null),
      ]);
      setProfile(p); setHistory(h); setTrades(tr); setHolders(ho);
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo cargar el tótem.");
    } finally { setLoading(false); }
  }, [selectedAddress, userId]);

  useEffect(() => { load(); }, [load]);

  const enriched = useMemo(() => profile ? enrich(profile) : null, [profile]);

  if (!selectedAddress) return null;

  function requestTrade(s: "buy" | "sell") {
    if (!isOrbVerified) { setOrbGate(true); return; }
    setSide(s);
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
        <button onClick={closeToken} className="p-2 -ml-2 rounded-lg hover:bg-white/5" aria-label="Volver">
          <ArrowLeft size={20} color="#ffffff" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
            {enriched ? shortAddr(enriched.address) : selectedAddress.slice(0, 10)}
          </div>
          <div className="text-white font-semibold truncate">{profile?.name ?? "…"}</div>
        </div>
      </div>

      {/* Body scroll */}
      <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
        {loading && (
          <div className="text-center text-sm py-10" style={{ color: "rgba(255,255,255,0.50)" }}>
            Cargando tótem…
          </div>
        )}
        {err && (
          <div className="mx-4 text-sm rounded-xl px-3 py-2"
            style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5" }}>
            {err}
          </div>
        )}

        {enriched && (
          <>
            {/* Hero price */}
            <div className="px-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(167,139,250,0.22))",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}>
                  {enriched.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {enriched.symbol} · L{enriched.level} · {enriched.badge || "—"}
                  </div>
                  <div className="text-3xl font-bold text-white tabular-nums mt-0.5">
                    {formatUsd(enriched.price, 6)}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="mx-4 mt-4 rounded-2xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Sparkline data={history} height={150} width={340} />
            </div>

            {/* Stats grid */}
            <div className="px-4 mt-4 grid grid-cols-2 gap-2">
              <Stat label="Supply"     value={formatCount(enriched.supply)}      hint={`${enriched.curvePercent.toFixed(1)}% a graduación`} color="#22c55e" />
              <Stat label="Volumen 24h" value={formatWld(enriched.volume_24h, 2)} />
              <Stat label="Score"      value={Math.round(enriched.score).toString()} color="#a78bfa" />
              <Stat label="Influence"  value={enriched.influence.toFixed(2)} />
              <Stat label="Holders"    value={holders ? formatCount(holders.total_holders) : "—"} />
              <Stat label="Creado"     value={new Date(enriched.created_at).toLocaleDateString()} />
            </div>

            {/* Tabs trades/holders */}
            <div className="px-4 mt-5 flex gap-2">
              {[
                { id: "trades" as Tab,  label: "Trades",  Icon: Clock },
                { id: "holders" as Tab, label: "Holders", Icon: Users },
              ].map(({ id, label, Icon }) => {
                const a = tab === id;
                return (
                  <button key={id} onClick={() => setTab(id)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                    style={{
                      background: a ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)",
                      border:     `1px solid ${a ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color:      a ? "#22c55e" : "rgba(255,255,255,0.60)",
                    }}>
                    <Icon size={13} /> {label}
                  </button>
                );
              })}
            </div>

            <div className="mx-4 mt-3 rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {tab === "trades" && (
                trades.length === 0
                  ? <div className="text-center text-xs py-6" style={{ color: "rgba(255,255,255,0.40)" }}>Sin trades aún.</div>
                  : trades.slice(0, 20).map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-3 py-2 text-xs"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold"
                            style={{ color: t.type === "buy" ? "#22c55e" : "#f87171" }}>
                            {t.type === "buy" ? "Buy" : "Sell"}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.45)" }}>{shortAddr(t.user)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white tabular-nums">{formatWld(t.amount, 3)}</div>
                          <div className="tabular-nums" style={{ color: "rgba(255,255,255,0.40)" }}>
                            {new Date(t.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
              )}
              {tab === "holders" && (
                !holders || holders.holders.length === 0
                  ? <div className="text-center text-xs py-6" style={{ color: "rgba(255,255,255,0.40)" }}>Sin holders aún.</div>
                  : holders.holders.map((h) => (
                      <div key={h.user_id} className="flex items-center justify-between px-3 py-2 text-xs"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: "rgba(255,255,255,0.65)" }}>{shortAddr(h.user_id)}</span>
                        <div className="text-right">
                          <div className="text-white tabular-nums">{formatCount(h.tokens)}</div>
                          <div className="tabular-nums" style={{ color: "rgba(255,255,255,0.40)" }}>
                            {h.share_pct.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Buy/Sell bar */}
      {enriched && walletAddress && (
        <div className="fixed left-0 right-0 z-[9995] px-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
          <div className="max-w-md mx-auto flex gap-2">
            <button onClick={() => requestTrade("buy")}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
                color: "#fff",
                boxShadow: "0 6px 20px rgba(34,197,94,0.35)",
              }}>
              <ShoppingCart size={16} /> Comprar
            </button>
            <button onClick={() => requestTrade("sell")}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{
                background: "rgba(248,113,113,0.12)",
                color: "#fca5a5",
                border: "1px solid rgba(248,113,113,0.35)",
              }}>
              <DollarSign size={16} /> Vender
            </button>
          </div>
        </div>
      )}

      {/* BuySellFullscreen overlay — reusa lógica MiniKit existente (lazy) */}
      <AnimatePresence>
        {side && enriched && walletAddress && (
          <Suspense fallback={null}>
            <BuySellFullscreen
              key="buysell"
              isDark
              totemAddress={enriched.address}
              totemName={enriched.name}
              totemPrice={enriched.price}
              userId={userId}
              walletAddress={walletAddress}
              canTrade={isOrbVerified}
              onRequestVerify={() => { setSide(null); setOrbGate(true); }}
              onClose={() => { setSide(null); load(); }}
              onTradeSuccess={() => { load(); }}
              initialSide={side}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {orbGate && (
        <OrbGateModal
          intent="trade"
          onClose={() => setOrbGate(false)}
          onVerify={async () => { await verifyOrb(); onOrbVerifiedChange(true); }}
        />
      )}
    </div>
  );
}

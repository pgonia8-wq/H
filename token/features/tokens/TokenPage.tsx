import { useState, useEffect, useCallback, useRef } from "react";
import { formatNum, formatCompact, timeAgo, type TokenDetail, type HolderInfo, type ActivityItem, type Candle } from "@/services/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import BuySellUI from "@/features/payments/BuySellUI";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, TrendingUp, Users, Activity, ExternalLink, Lock, Flame, Copy, Check } from "lucide-react";

type TabName = "overview" | "holders" | "activity";
type ChartPeriod = "1h" | "6h" | "24h" | "7d" | "30d" | "all";

function CandlestickChart({ tokenId }: { tokenId: string }) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [period, setPeriod] = useState<ChartPeriod>("24h");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getPriceHistory(tokenId, period)
      .then((res) => { if (!cancelled) { setCandles(res.candles ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tokenId, period]);

  useEffect(() => {
    const iv = setInterval(() => {
      api.getPriceHistory(tokenId, period)
        .then((res) => setCandles(res.candles ?? []))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(iv);
  }, [tokenId, period]);

  const periods: ChartPeriod[] = ["1h", "6h", "24h", "7d", "30d", "all"];

  if (loading) {
    return <div className="h-52 rounded-2xl bg-card/40 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>;
  }

  if (candles.length === 0) {
    return (
      <div className="rounded-2xl bg-card/40 border border-border/30 p-4">
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">Chart available after first trades</div>
        <PeriodSelector periods={periods} current={period} onChange={setPeriod} />
      </div>
    );
  }

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || minP * 0.01 || 0.0000001;
  const padding = range * 0.12;
  const adjMin = minP - padding;
  const adjMax = maxP + padding;
  const adjRange = adjMax - adjMin;

  const svgW = 340;
  const svgH = 160;
  const candleW = Math.max(2, Math.min(10, (svgW - 20) / candles.length - 1));
  const gap = 1;
  const totalCandleW = candleW + gap;
  const startX = Math.max(0, (svgW - candles.length * totalCandleW) / 2);

  return (
    <div className="rounded-2xl bg-card/40 border border-border/30 overflow-hidden">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect width={svgW} height={svgH} fill="url(#grid-fade)" />
        {[0.25, 0.5, 0.75].map((pct) => (
          <line key={pct} x1={0} x2={svgW} y1={svgH * pct} y2={svgH * pct} stroke="rgba(255,255,255,0.04)" strokeDasharray="4,4" />
        ))}
        {candles.map((c, i) => {
          const x = startX + i * totalCandleW;
          const bullish = c.close >= c.open;
          const color = bullish ? "#10b981" : "#ef4444";
          const wickTop = svgH - ((c.high - adjMin) / adjRange) * (svgH - 10) - 5;
          const wickBot = svgH - ((c.low - adjMin) / adjRange) * (svgH - 10) - 5;
          const bodyTop = svgH - ((Math.max(c.open, c.close) - adjMin) / adjRange) * (svgH - 10) - 5;
          const bodyBot = svgH - ((Math.min(c.open, c.close) - adjMin) / adjRange) * (svgH - 10) - 5;
          const bodyH = Math.max(1, bodyBot - bodyTop);
          return (
            <g key={i}>
              <line x1={x + candleW / 2} x2={x + candleW / 2} y1={wickTop} y2={wickBot} stroke={color} strokeWidth={1} opacity={0.7} />
              <rect x={x} y={bodyTop} width={candleW} height={bodyH} fill={color} rx={0.5} />
            </g>
          );
        })}
      </svg>
      <div className="px-3 pb-3">
        <PeriodSelector periods={periods} current={period} onChange={setPeriod} />
      </div>
    </div>
  );
}

function PeriodSelector({ periods, current, onChange }: { periods: ChartPeriod[]; current: ChartPeriod; onChange: (p: ChartPeriod) => void }) {
  return (
    <div className="flex gap-1 mt-2">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          data-testid={`period-${p}`}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            current === p ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-card/30 border border-border/20">
      <div className="text-xs font-bold truncate" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function TokenPage() {
  const { selectedTokenId, navigate, formatPrice, user, displayCurrency, wldUsdRate } = useApp();
  const [token, setToken] = useState<TokenDetail | null>(null);
  const [holders, setHolders] = useState<HolderInfo[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabName>("overview");
  const [showTrade, setShowTrade] = useState<"buy" | "sell" | null>(null);
  const [copied, setCopied] = useState(false);

  const loadToken = useCallback(async () => {
    if (!selectedTokenId) return;
    try {
      const data = await api.getToken(selectedTokenId);
      setToken(data);
    } catch (err) {
      console.error("[TokenPage] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTokenId]);

  useEffect(() => {
    loadToken();
    const iv = setInterval(loadToken, 8000);
    return () => clearInterval(iv);
  }, [loadToken]);

  useEffect(() => {
    if (!selectedTokenId) return;
    if (tab === "holders") api.getTokenHolders(selectedTokenId).then(setHolders).catch(() => {});
    if (tab === "activity") api.getTokenActivity(selectedTokenId).then((r) => setActivities(r.activities)).catch(() => {});
  }, [selectedTokenId, tab]);

  const copyAddress = () => {
    if (token?.contractAddress) {
      navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !token) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-24 bg-card/40 rounded-lg animate-pulse" />
        <div className="h-52 bg-card/40 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-card/40 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const isPositive = token.change24h >= 0;
  const curvePercent = token.curvePercent ?? 0;
  const stats = token.stats;

  return (
    <div className="min-h-full pb-24" data-testid="token-page">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/30">
        <button onClick={() => navigate("discovery")} data-testid="button-back" className="p-2 -ml-2 rounded-xl hover:bg-card/60 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{token.emoji}</span>
          <div className="min-w-0">
            <div className="font-bold text-sm text-foreground truncate">{token.name}</div>
            <div className="text-[11px] text-muted-foreground">{token.symbol}</div>
          </div>
        </div>
        {token.graduated && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Graduated</span>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              ${token.priceUsdc < 0.01 ? token.priceUsdc.toFixed(7) : token.priceUsdc.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{token.priceWld.toFixed(7)} WLD</div>
          </div>
          <div className={`text-lg font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{token.change24h.toFixed(1)}%
          </div>
        </div>

        <CandlestickChart tokenId={token.id} />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">Bonding Curve</span>
            <span className={`text-xs font-bold ${curvePercent >= 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {curvePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(curvePercent, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: curvePercent >= 100
                  ? "linear-gradient(90deg, #10b981, #06d6f7)"
                  : "linear-gradient(90deg, #f59e0b, #ef4444)",
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>{formatNum(token.totalWldInCurve ?? 0)} WLD raised</span>
            <span>2,000 WLD goal</span>
          </div>
        </div>

        <div className="flex rounded-xl bg-card/40 border border-border/30 overflow-hidden">
          {(["overview", "holders", "activity"] as TabName[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className={`flex-1 py-2.5 text-xs font-bold capitalize transition-all ${
                tab === t ? "bg-primary/15 text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{token.description}</p>

              {token.contractAddress && (
                <button onClick={copyAddress} data-testid="button-copy-address" className="flex items-center gap-2 w-full p-3 rounded-xl bg-card/40 border border-border/30 hover:border-primary/30 transition-all">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Contract</span>
                  <span className="text-xs text-foreground font-mono flex-1 text-left truncate">{token.contractAddress}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              )}

              <div className="grid grid-cols-3 gap-2">
                <StatCard label="Price USD" value={`$${token.priceUsdc.toFixed(7)}`} />
                <StatCard label="Price WLD" value={`${token.priceWld.toFixed(7)}`} />
                <StatCard label="Market Cap" value={`$${formatCompact(token.marketCap)}`} />
                <StatCard label="24h Volume" value={`$${formatCompact(token.volume24h)}`} />
                <StatCard label="Liquidity" value={`${formatNum(token.totalWldInCurve ?? 0)} WLD`} />
                <StatCard label="FDV" value={`$${formatCompact(token.priceUsdc * token.totalSupply)}`} />
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1 p-2.5 rounded-xl bg-card/30 border border-border/20">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-foreground">
                    {token.lockedSupply > 0 ? `${((token.lockedSupply / token.totalSupply) * 100).toFixed(1)}% Locked` : "0% Locked"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 p-2.5 rounded-xl bg-card/30 border border-border/20">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] text-foreground">
                    {token.burnedSupply > 0 ? `${((token.burnedSupply / token.totalSupply) * 100).toFixed(1)}% Burned` : "0% Burned"}
                  </span>
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="TXNS" value={String(stats.txns)} />
                  <StatCard label="BUYS" value={String(stats.buys)} color="#10b981" />
                  <StatCard label="SELLS" value={String(stats.sells)} color="#ef4444" />
                  <StatCard label="BUY VOL" value={`$${formatCompact(stats.buyVolume)}`} color="#10b981" />
                  <StatCard label="SELL VOL" value={`$${formatCompact(stats.sellVolume)}`} color="#ef4444" />
                  <StatCard label="MAKERS" value={String(stats.makers)} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-card/30 border border-border/20">
                  <span className="text-muted-foreground">Supply: </span>
                  <span className="text-foreground font-medium">{formatCompact(token.totalSupply)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card/30 border border-border/20">
                  <span className="text-muted-foreground">Holders: </span>
                  <span className="text-foreground font-medium">{token.holders.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "holders" && (
            <motion.div key="holders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {holders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No holders yet</div>
              ) : (
                holders.map((h, i) => (
                  <div key={h.userId} className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/20">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {h.username?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{h.username}</div>
                      <div className="text-[11px] text-muted-foreground">{formatCompact(h.amount)} tokens</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-foreground">{h.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No activity yet</div>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/20">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      a.type === "buy" ? "bg-emerald-500/20 text-emerald-400" :
                      a.type === "sell" ? "bg-red-500/20 text-red-400" :
                      a.type === "create" ? "bg-violet-500/20 text-violet-400" :
                      "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {a.type === "buy" ? "B" : a.type === "sell" ? "S" : a.type === "create" ? "C" : "G"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{a.username}</span>{" "}
                        <span className="text-muted-foreground">{a.type === "buy" ? "bought" : a.type === "sell" ? "sold" : a.type}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{timeAgo(a.timestamp)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground">{formatCompact(a.amount)}</div>
                      {a.total != null && <div className="text-[10px] text-muted-foreground">${formatNum(a.total)}</div>}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!token.graduated && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-background/80 backdrop-blur-xl border-t border-border/30 max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {showTrade ? (
              <motion.div key="trade" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <BuySellUI token={token} onSuccess={() => { setShowTrade(null); loadToken(); }} defaultTab={showTrade} onClose={() => setShowTrade(null)} />
              </motion.div>
            ) : (
              <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                <button
                  onClick={() => setShowTrade("buy")}
                  data-testid="button-buy"
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm active:scale-[0.97] transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Buy
                </button>
                <button
                  onClick={() => setShowTrade("sell")}
                  data-testid="button-sell"
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold text-sm active:scale-[0.97] transition-transform shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Sell
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { formatNum, formatCompact, type Token } from "@/services/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Flame, Rocket, ArrowUpDown, RefreshCw } from "lucide-react";

type SortOption = "newest" | "volume" | "marketcap" | "holders";

function TokenCard({ token, onClick, index }: { token: Token; onClick: () => void; index: number }) {
  const isPositive = token.change24h >= 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onClick}
      data-testid={`card-token-${token.id}`}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border/40 hover:border-primary/30 active:scale-[0.98] transition-all duration-200 text-left backdrop-blur-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-xl shrink-0 border border-border/30">
        {token.avatarUrl ? (
          <img src={token.avatarUrl} alt={token.name} className="w-full h-full rounded-xl object-cover" />
        ) : (
          token.emoji
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">{token.name}</span>
          {token.graduated && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">DEX</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{token.symbol}</span>
          <div className="h-3 w-px bg-border/50" />
          <span className="text-xs text-muted-foreground">MC ${formatCompact(token.marketCap)}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-foreground">${token.priceUsdc < 0.01 ? token.priceUsdc.toFixed(7) : token.priceUsdc.toFixed(4)}</div>
        <div className={`text-xs font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}{token.change24h.toFixed(1)}%
        </div>
      </div>

      <div className="w-12 shrink-0">
        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(token.curvePercent, 100)}%`,
              background: token.curvePercent >= 100 ? "#10b981" : token.curvePercent > 70 ? "#f59e0b" : "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            }}
          />
        </div>
        <div className="text-[9px] text-center mt-0.5 text-muted-foreground font-medium">{token.curvePercent.toFixed(0)}%</div>
      </div>
    </motion.button>
  );
}

function HotCard({ token, onClick }: { token: Token; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      data-testid={`hot-token-${token.id}`}
      className="shrink-0 w-32 p-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 text-left"
    >
      <div className="text-2xl mb-1">{token.emoji}</div>
      <div className="font-bold text-sm text-foreground truncate">{token.symbol}</div>
      <div className="text-[11px] text-muted-foreground truncate">{token.name}</div>
      <div className="text-emerald-400 text-xs font-bold mt-1">+{token.change24h.toFixed(0)}%</div>
    </motion.button>
  );
}

function NewCard({ token, onClick }: { token: Token; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      data-testid={`new-token-${token.id}`}
      className="shrink-0 w-32 p-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-left"
    >
      <div className="text-2xl mb-1">{token.emoji}</div>
      <div className="font-bold text-sm text-foreground truncate">{token.symbol}</div>
      <div className="text-[11px] text-muted-foreground truncate">{token.name}</div>
      <div className="flex items-center gap-1 mt-1">
        <div className="h-1 flex-1 rounded-full bg-muted/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${token.curvePercent}%` }} />
        </div>
        <span className="text-[9px] text-cyan-400 font-bold">{token.curvePercent.toFixed(0)}%</span>
      </div>
    </motion.button>
  );
}

export default function DiscoveryPage() {
  const { navigate, formatPrice } = useApp();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTokens = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await api.getTokens({ sort });
      setAllTokens(res.tokens);
    } catch (err) {
      console.error("[DiscoveryPage] Error loading tokens:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sort]);

  useEffect(() => {
    loadTokens();
    intervalRef.current = setInterval(() => loadTokens(), 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadTokens]);

  const filtered = allTokens.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const exploding = allTokens.filter((t) => t.change24h > 50).sort((a, b) => b.change24h - a.change24h);
  const newTokens = allTokens.filter((t) => t.curvePercent < 20).sort((a, b) => a.curvePercent - b.curvePercent);

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "newest", label: "New" },
    { key: "volume", label: "Volume" },
    { key: "marketcap", label: "MCap" },
    { key: "holders", label: "Holders" },
  ];

  return (
    <div className="min-h-full pb-4" data-testid="discovery-page">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-2 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Token Market</h1>
            <p className="text-[11px] text-muted-foreground">World App Mini - Verified humans only</p>
          </div>
          <button
            onClick={() => loadTokens(true)}
            data-testid="button-refresh"
            className="p-2 rounded-xl bg-card/60 border border-border/40 active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            data-testid="input-search"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/60 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="px-4 pt-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-card/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="px-4 pt-3 space-y-5">
          {!search && exploding.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-foreground">Exploding Now</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                {exploding.slice(0, 8).map((t) => (
                  <HotCard key={t.id} token={t} onClick={() => navigate("token", { tokenId: t.id })} />
                ))}
              </div>
            </section>
          )}

          {!search && newTokens.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-foreground">Get In Early</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                {newTokens.slice(0, 8).map((t) => (
                  <NewCard key={t.id} token={t} onClick={() => navigate("token", { tokenId: t.id })} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-foreground">
                {search ? `Results (${filtered.length})` : "All Tokens"}
              </h2>
              {!search && (
                <div className="flex gap-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSort(opt.key)}
                      data-testid={`sort-${opt.key}`}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        sort === opt.key
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No tokens found</div>
              ) : (
                filtered.map((t, i) => (
                  <TokenCard key={t.id} token={t} index={i} onClick={() => navigate("token", { tokenId: t.id })} />
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

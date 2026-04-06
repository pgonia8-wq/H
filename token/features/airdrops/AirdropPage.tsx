import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import type { Airdrop } from "@/services/types";
import { formatCompact } from "@/services/types";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Clock, Users, Loader2, CheckCircle2, RefreshCw } from "lucide-react";

function AirdropCard({ airdrop, onClaim, claiming }: { airdrop: Airdrop; onClaim: (id: string) => void; claiming: boolean }) {
  const progress = airdrop.totalAmount > 0 ? airdrop.claimedAmount / airdrop.totalAmount : 0;
  const spotsLeft = airdrop.maxParticipants - airdrop.participants;
  const canClaim = !airdrop.hasClaimed && airdrop.isActive && spotsLeft > 0;

  const daysLeft = Math.max(0, Math.ceil((new Date(airdrop.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const getCountdown = () => {
    if (!airdrop.nextClaimAt) return null;
    const diff = new Date(airdrop.nextClaimAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const countdown = getCountdown();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm space-y-3"
      data-testid={`card-airdrop-${airdrop.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 flex items-center justify-center text-2xl border border-border/30 shrink-0">
          {airdrop.tokenEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground">{airdrop.title}</h3>
          <div className="text-[11px] text-muted-foreground">{airdrop.tokenName}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-bold text-emerald-400">+{airdrop.dailyAmount.toLocaleString()} {airdrop.tokenSymbol}</span>
            <span className="text-[10px] text-muted-foreground">every {airdrop.cooldownHours}h</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{airdrop.description}</p>

      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{(progress * 100).toFixed(1)}% claimed</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-card/30">
          <div className="text-xs font-bold text-foreground">{formatCompact(spotsLeft)}</div>
          <div className="text-[9px] text-muted-foreground">spots left</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-card/30">
          <div className="text-xs font-bold text-foreground">{airdrop.participants.toLocaleString()}</div>
          <div className="text-[9px] text-muted-foreground">joined</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-card/30">
          <div className="text-xs font-bold text-foreground">{daysLeft}d</div>
          <div className="text-[9px] text-muted-foreground">remaining</div>
        </div>
      </div>

      <button
        onClick={() => onClaim(airdrop.id)}
        disabled={!canClaim || claiming}
        data-testid={`button-claim-${airdrop.id}`}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] disabled:active:scale-100 ${
          canClaim
            ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            : "bg-card/40 text-muted-foreground cursor-not-allowed"
        }`}
      >
        {claiming ? (
          <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Claiming...</span>
        ) : airdrop.hasClaimed ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {countdown ? `Next claim in ${countdown}` : "Claimed"}
          </span>
        ) : (
          `Claim ${airdrop.dailyAmount.toLocaleString()} ${airdrop.tokenSymbol}`
        )}
      </button>
    </motion.div>
  );
}

export default function AirdropPage() {
  const { user } = useApp();
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAirdrops = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await api.getAirdrops(user?.id);
      setAirdrops(res.airdrops);
    } catch (err) {
      console.error("[AirdropPage] Error loading airdrops:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAirdrops();
    intervalRef.current = setInterval(() => loadAirdrops(), 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadAirdrops]);

  const handleClaim = async (id: string) => {
    if (!user?.id) return;
    setClaimingId(id);
    try {
      const result = await api.claimAirdrop({ airdropId: id, userId: user.id });
      if (result.success) {
        await loadAirdrops();
      }
    } catch (err) {
      console.error("[AirdropPage] Claim error:", err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-full pb-4" data-testid="airdrop-page">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-violet-400" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">Airdrops</h1>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Claim free tokens daily - verified humans only</p>
          </div>
          <button
            onClick={() => loadAirdrops(true)}
            data-testid="button-refresh-airdrops"
            className="p-2 rounded-xl bg-card/60 border border-border/40 active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : airdrops.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Gift className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <div className="text-sm text-muted-foreground">No active airdrops right now</div>
            <div className="text-xs text-muted-foreground/70">Check back soon for new opportunities</div>
          </div>
        ) : (
          <div className="space-y-3">
            {airdrops.map((a) => (
              <AirdropCard key={a.id} airdrop={a} onClaim={handleClaim} claiming={claimingId === a.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

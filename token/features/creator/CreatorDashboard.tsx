import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import type { Token } from "@/services/types";
import { formatCompact } from "@/services/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, CheckCircle2, ShieldAlert, Camera, Sparkles,
  ArrowRight, Lock, Flame, Gift, ChevronRight, BarChart3,
  Users, TrendingUp, Coins, AlertTriangle, Shield, Clock,
  Rocket, Settings2, Eye, Copy, ExternalLink, Zap, Star,
  Percent, Timer, Target, Layers, PieChart
} from "lucide-react";

type MainView = "hub" | "create" | "manage";
type ManageTool = "lock" | "burn" | "airdrop" | null;
type CreateStep = "form" | "checking_orb" | "paying" | "creating" | "success" | "orb_required";

interface TokenForm {
  name: string;
  symbol: string;
  emoji: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
}

const EMOJIS = ["🌟","💜","🔺","🔥","🌊","🌀","⚡","🦋","🧬","🎯","🪄","🌙","🦄","🏆","🌈","💎","🚀","🪐","🎮","🎵","🎨","🌺","🐉","🦊","⭐","🔮","🎪","🍀","🦅","🐋"];
const CREATION_FEE = 5;
const RECEIVER = import.meta.env?.VITE_PAYMENT_RECEIVER || "";

function generatePayReference(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function StatBox({ label, value, icon: Icon, color = "text-foreground" }: { label: string; value: string; icon: typeof Coins; color?: string }) {
  return (
    <div className="p-3 rounded-xl bg-secondary/30 border border-border/15 flex flex-col items-center gap-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
      <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

function ToolCard({ icon: Icon, label, desc, color, onClick }: { icon: typeof Lock; label: string; desc: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full p-3.5 rounded-xl bg-card/40 border border-border/20 flex items-center gap-3 active:scale-[0.98] transition-all hover:border-border/40 text-left">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function LockPanel({ token, userId, onDone }: { token: Token; userId: string; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxLockable = token.circulatingSupply;
  const numAmount = parseFloat(amount) || 0;
  const numDays = parseInt(days) || 0;
  const pct = maxLockable > 0 ? (numAmount / maxLockable * 100) : 0;

  const handleLock = async () => {
    if (numAmount <= 0) { setError("Enter amount to lock"); return; }
    if (numAmount > maxLockable) { setError(`Max lockable: ${formatCompact(maxLockable)}`); return; }
    if (numDays < 1) { setError("Min lock: 1 day"); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.lockTokens({ tokenId: token.id, amount: numAmount, durationDays: numDays, userId });
      if (res.success) { setSuccess(true); setTimeout(onDone, 1500); }
      else setError(res.message);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 space-y-2">
      <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
      <div className="text-sm font-bold text-foreground">Tokens Locked</div>
      <div className="text-[11px] text-muted-foreground">{formatCompact(numAmount)} {token.symbol} locked for {numDays} days</div>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-bold text-foreground">Lock {token.symbol}</span>
      </div>
      <div className="p-2.5 rounded-lg bg-blue-500/8 border border-blue-500/15 text-[10px] text-blue-400 flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Locking tokens removes them from circulation for the specified duration. This builds trust and shows commitment to holders.</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card items-center">
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Currently Locked</span>
          <span className="text-xs font-bold text-blue-400 font-mono">{formatCompact(token.lockedSupply)}</span>
        </div>
        <div className="stat-card items-center">
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Lockable</span>
          <span className="text-xs font-bold text-foreground font-mono">{formatCompact(maxLockable)}</span>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Amount to Lock</label>
        <div className="relative">
          <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }}
            placeholder="0" className="w-full p-3 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">{token.symbol}</div>
        </div>
        {numAmount > 0 && <div className="text-[9px] text-muted-foreground mt-1">{pct.toFixed(1)}% of circulating supply</div>}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[25, 50, 75, 100].map(p => (
          <button key={p} onClick={() => setAmount(String(Math.floor(maxLockable * p / 100)))}
            className="py-1.5 rounded-md text-[9px] font-bold bg-blue-500/8 text-blue-400 border border-blue-500/15 hover:bg-blue-500/15 active:scale-95 transition-all">
            {p}%
          </button>
        ))}
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Lock Duration</label>
        <div className="grid grid-cols-4 gap-1.5">
          {["7", "30", "90", "180"].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`py-2 rounded-lg text-[10px] font-bold transition-all ${days === d ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-secondary/30 text-muted-foreground border border-border/20"}`}>
              {d}d
            </button>
          ))}
        </div>
        <input type="number" value={days} onChange={(e) => setDays(e.target.value)} min={1}
          className="w-full mt-1.5 p-2 rounded-lg bg-secondary/30 border border-border/20 text-xs text-foreground font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="Custom days" />
      </div>

      {error && <div className="text-[11px] text-red-400 bg-red-500/8 border border-red-500/15 p-2.5 rounded-lg">{error}</div>}

      <button onClick={handleLock} disabled={loading || numAmount <= 0}
        className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.97] transition-all disabled:opacity-30 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Lock Tokens</>}
      </button>
    </div>
  );
}

function BurnPanel({ token, userId, onDone }: { token: Token; userId: string; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxBurnable = token.circulatingSupply;
  const numAmount = parseFloat(amount) || 0;
  const pct = maxBurnable > 0 ? (numAmount / maxBurnable * 100) : 0;

  const handleBurn = async () => {
    if (numAmount <= 0) { setError("Enter amount to burn"); return; }
    if (numAmount > maxBurnable) { setError(`Max burnable: ${formatCompact(maxBurnable)}`); return; }
    if (!confirmed) { setError("Confirm the burn action"); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.burnTokens({ tokenId: token.id, amount: numAmount, userId });
      if (res.success) { setSuccess(true); setTimeout(onDone, 1500); }
      else setError(res.message);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 space-y-2">
      <CheckCircle2 className="w-10 h-10 text-orange-400 mx-auto" />
      <div className="text-sm font-bold text-foreground">Tokens Burned</div>
      <div className="text-[11px] text-muted-foreground">{formatCompact(numAmount)} {token.symbol} permanently destroyed</div>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-bold text-foreground">Burn {token.symbol}</span>
      </div>

      <div className="p-2.5 rounded-lg bg-red-500/8 border border-red-500/15 text-[10px] text-red-400 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Burning is PERMANENT and IRREVERSIBLE. Burned tokens are destroyed forever, reducing total supply and increasing scarcity.</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card items-center">
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Already Burned</span>
          <span className="text-xs font-bold text-orange-400 font-mono">{formatCompact(token.burnedSupply)}</span>
        </div>
        <div className="stat-card items-center">
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Burnable</span>
          <span className="text-xs font-bold text-foreground font-mono">{formatCompact(maxBurnable)}</span>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Amount to Burn</label>
        <div className="relative">
          <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); setConfirmed(false); }}
            placeholder="0" className="w-full p-3 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">{token.symbol}</div>
        </div>
        {numAmount > 0 && <div className="text-[9px] text-muted-foreground mt-1">{pct.toFixed(1)}% of circulating supply</div>}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[5, 10, 25, 50].map(p => (
          <button key={p} onClick={() => { setAmount(String(Math.floor(maxBurnable * p / 100))); setConfirmed(false); }}
            className="py-1.5 rounded-md text-[9px] font-bold bg-orange-500/8 text-orange-400 border border-orange-500/15 hover:bg-orange-500/15 active:scale-95 transition-all">
            {p}%
          </button>
        ))}
      </div>

      {numAmount > 0 && (
        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="w-4 h-4 rounded accent-red-500" />
          <span className="text-[10px] text-red-400 font-medium">I understand this action is permanent and irreversible</span>
        </label>
      )}

      {error && <div className="text-[11px] text-red-400 bg-red-500/8 border border-red-500/15 p-2.5 rounded-lg">{error}</div>}

      <button onClick={handleBurn} disabled={loading || numAmount <= 0 || !confirmed}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 active:scale-[0.97] transition-all disabled:opacity-30 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Flame className="w-4 h-4" /> Burn Forever</>}
      </button>
    </div>
  );
}

function AirdropPanel({ token, userId, onDone }: { token: Token; userId: string; onDone: () => void }) {
  const [title, setTitle] = useState(`${token.symbol} Airdrop`);
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [dailyAmount, setDailyAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("500");
  const [cooldownHours, setCooldownHours] = useState("24");
  const [durationDays, setDurationDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const numTotal = parseFloat(totalAmount) || 0;
  const numDaily = parseFloat(dailyAmount) || 0;
  const numMaxPart = parseInt(maxParticipants) || 0;

  const handleCreate = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    if (numTotal <= 0) { setError("Set total airdrop amount"); return; }
    if (numDaily <= 0) { setError("Set daily claim amount"); return; }
    if (numMaxPart <= 0) { setError("Set max participants"); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.createAirdrop({
        tokenId: token.id, title: title.trim(), description: description.trim(),
        totalAmount: numTotal, dailyAmount: numDaily, maxParticipants: numMaxPart,
        cooldownHours: parseInt(cooldownHours) || 24, durationDays: parseInt(durationDays) || 30,
        creatorId: userId,
      });
      if (res.success) { setSuccess(true); setTimeout(onDone, 1500); }
      else setError(res.message);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 space-y-2">
      <CheckCircle2 className="w-10 h-10 text-violet-400 mx-auto" />
      <div className="text-sm font-bold text-foreground">Airdrop Created</div>
      <div className="text-[11px] text-muted-foreground">{formatCompact(numTotal)} {token.symbol} ready for distribution</div>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Gift className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-bold text-foreground">Create Airdrop — {token.symbol}</span>
      </div>

      <div className="p-2.5 rounded-lg bg-violet-500/8 border border-violet-500/15 text-[10px] text-violet-400 flex items-start gap-2">
        <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Create a claimable airdrop for verified World ID users. Tokens are distributed from your token's supply pool.</span>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Airdrop Title</label>
        <input value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }}
          className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 transition-all" />
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Description (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe your airdrop..."
          className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 resize-none transition-all" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Total Pool</label>
          <input type="number" value={totalAmount} onChange={(e) => { setTotalAmount(e.target.value); setError(null); }}
            placeholder="100000" className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Per Claim</label>
          <input type="number" value={dailyAmount} onChange={(e) => { setDailyAmount(e.target.value); setError(null); }}
            placeholder="100" className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Max Users</label>
          <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-xs text-foreground font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Cooldown</label>
          <div className="grid grid-cols-3 gap-1">
            {["12", "24", "48"].map(h => (
              <button key={h} onClick={() => setCooldownHours(h)}
                className={`py-2 rounded-lg text-[9px] font-bold transition-all ${cooldownHours === h ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-secondary/30 text-muted-foreground border border-border/20"}`}>
                {h}h
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Duration</label>
          <div className="grid grid-cols-3 gap-1">
            {["7", "30", "90"].map(d => (
              <button key={d} onClick={() => setDurationDays(d)}
                className={`py-2 rounded-lg text-[9px] font-bold transition-all ${durationDays === d ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-secondary/30 text-muted-foreground border border-border/20"}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {numTotal > 0 && numDaily > 0 && (
        <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/15 space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Total claims possible</span><span className="text-foreground font-bold font-mono">{Math.floor(numTotal / numDaily).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Est. per participant</span><span className="text-foreground font-mono">{numMaxPart > 0 ? formatCompact(numTotal / numMaxPart) : "—"} {token.symbol}</span></div>
        </div>
      )}

      {error && <div className="text-[11px] text-red-400 bg-red-500/8 border border-red-500/15 p-2.5 rounded-lg">{error}</div>}

      <button onClick={handleCreate} disabled={loading || numTotal <= 0 || numDaily <= 0}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 active:scale-[0.97] transition-all disabled:opacity-30 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gift className="w-4 h-4" /> Create Airdrop</>}
      </button>
    </div>
  );
}

function TokenManageCard({ token, onSelect }: { token: Token; onSelect: (t: Token) => void }) {
  const progress = token.curvePercent || 0;
  return (
    <button onClick={() => onSelect(token)} className="w-full p-3.5 rounded-xl bg-card/40 border border-border/20 flex items-center gap-3 active:scale-[0.98] transition-all hover:border-green-500/20 text-left">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 flex items-center justify-center text-lg border border-green-500/10 shrink-0">
        {token.avatarUrl ? <img src={token.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" /> : token.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm text-foreground">{token.symbol}</span>
          {token.graduated && <span className="badge-green">DEX</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{formatCompact(token.holders)} holders</span>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className="text-[10px] text-muted-foreground">{formatCompact(token.volume24h)} vol</span>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-secondary/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-bold text-foreground font-mono">{token.priceWld.toFixed(6)}</div>
        <div className="text-[9px] text-muted-foreground">WLD</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function CreatorDashboard() {
  const { closeCreatorDashboard, user, navigate } = useApp();
  const [view, setView] = useState<MainView>("hub");
  const [createStep, setCreateStep] = useState<CreateStep>("form");
  const [form, setForm] = useState<TokenForm>({ name: "", symbol: "", emoji: "🌟", description: "", twitter: "", telegram: "", website: "" });
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdTokenId, setCreatedTokenId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const [myTokens, setMyTokens] = useState<Token[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [activeTool, setActiveTool] = useState<ManageTool>(null);

  const loadCreatorTokens = useCallback(async () => {
    if (!user?.id || user.id === "usr_guest") return;
    setTokensLoading(true);
    try {
      const res = await api.getCreatorTokens(user.id);
      setMyTokens(res.tokens);
    } catch (e) { console.error("[Creator] Error loading tokens:", e); }
    finally { setTokensLoading(false); }
  }, [user?.id]);

  useEffect(() => { loadCreatorTokens(); }, [loadCreatorTokens]);

  const updateField = (key: keyof TokenForm, value: string) => { setForm(f => ({ ...f, [key]: value })); setError(null); };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { const result = reader.result as string; setAvatarBase64(result.split(",")[1]); setAvatarPreview(result); };
    reader.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Token name is required";
    if (form.name.length > 32) return "Name must be 32 characters or less";
    if (!form.symbol.trim()) return "Symbol is required";
    if (form.symbol.length < 2 || form.symbol.length > 8) return "Symbol must be 2-8 characters";
    if (form.description.length < 10) return "Description must be at least 10 characters";
    return null;
  };

  const requestPayment = (amountWld: number, description: string): Promise<string> => {
    if (!RECEIVER) return Promise.reject(new Error("Payment receiver not configured"));
    const origin = import.meta.env?.VITE_PARENT_ORIGIN || "*";
    const reference = generatePayReference();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { window.removeEventListener("message", handler); cancelRef.current = null; reject(new Error("Payment timeout")); }, 120000);
      cancelRef.current = () => { clearTimeout(timeout); window.removeEventListener("message", handler); cancelRef.current = null; reject(new Error("Payment cancelled")); };
      const handler = (e: MessageEvent) => {
        if (e.data?.type === "PAYMENT_RESULT") {
          clearTimeout(timeout); window.removeEventListener("message", handler); cancelRef.current = null;
          if (e.data.payload?.success && e.data.payload?.transactionId) resolve(e.data.payload.transactionId);
          else reject(new Error(e.data.payload?.error || "Payment failed"));
        }
      };
      window.addEventListener("message", handler);
      window.parent?.postMessage({ type: "REQUEST_PAYMENT", payload: { reference, to: RECEIVER, amount: amountWld, token: "WLD", description } }, origin);
    });
  };

  const handleCreateSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setCreateStep("checking_orb"); setError(null);
    try {
      if (!user?.id) throw new Error("Not authenticated");
      const orbRes = await api.checkOrbStatus(user.id);
      if (!orbRes.orbVerified) { setCreateStep("orb_required"); return; }
      setCreateStep("paying");
      const transactionId = await requestPayment(CREATION_FEE, `Create token: ${form.symbol}`);
      setCreateStep("creating");
      let avatarUrl: string | undefined;
      if (avatarBase64) {
        const uploadRes = await api.uploadAvatar(avatarBase64, user.id, "token", undefined, `${form.symbol}.png`);
        if (uploadRes.success) avatarUrl = uploadRes.url;
      }
      const token = await api.createToken({
        name: form.name.trim(), symbol: form.symbol.toUpperCase().trim(), description: form.description.trim(),
        emoji: form.emoji, creatorId: user.id, avatarUrl, transactionId,
        twitter: form.twitter.trim() || undefined, telegram: form.telegram.trim() || undefined, website: form.website.trim() || undefined,
      });
      setCreatedTokenId(token.id); setCreateStep("success"); loadCreatorTokens();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("cancelled")) setCreateStep("form");
      else { setError(msg); setCreateStep("form"); }
    }
  };

  const handleCancelPayment = () => { if (cancelRef.current) cancelRef.current(); else setCreateStep("form"); };

  const totalMcap = myTokens.reduce((s, t) => s + t.marketCap, 0);
  const totalHolders = myTokens.reduce((s, t) => s + t.holders, 0);
  const totalVolume = myTokens.reduce((s, t) => s + t.volume24h, 0);

  return (
    <div className="min-h-full bg-background" data-testid="creator-dashboard">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-2xl px-4 py-3 flex items-center justify-between border-b border-border/20">
        <div className="flex items-center gap-2">
          {(view !== "hub") && (
            <button onClick={() => { if (activeTool) { setActiveTool(null); } else if (selectedToken) { setSelectedToken(null); } else { setView("hub"); setCreateStep("form"); } }}
              className="p-1.5 rounded-lg hover:bg-secondary/40 active:scale-95 transition-all">
              <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
            </button>
          )}
          <div>
            <h2 className="text-base font-black text-foreground tracking-tight">
              {view === "hub" ? "Creator Hub" : view === "create" ? "Launch Token" : selectedToken ? (activeTool ? (activeTool === "lock" ? "Lock Tokens" : activeTool === "burn" ? "Burn Tokens" : "Create Airdrop") : selectedToken.symbol) : "My Tokens"}
            </h2>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
              {view === "hub" ? "Build & manage your tokens" : view === "create" ? "Deploy on bonding curve" : activeTool ? `${selectedToken?.symbol} tools` : "Token management"}
            </p>
          </div>
        </div>
        <button onClick={closeCreatorDashboard} data-testid="button-close-creator" className="p-2 rounded-lg hover:bg-secondary/40 active:scale-95 transition-all">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 pt-3 pb-20">
        <AnimatePresence mode="wait">
          {view === "hub" && (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Tokens" value={String(myTokens.length)} icon={Layers} color="text-green-400" />
                <StatBox label="Holders" value={formatCompact(totalHolders)} icon={Users} color="text-blue-400" />
                <StatBox label="Volume" value={formatCompact(totalVolume)} icon={BarChart3} color="text-violet-400" />
              </div>

              {totalMcap > 0 && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-green-500/8 to-emerald-500/5 border border-green-500/15">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Market Cap</div>
                  <div className="text-xl font-black text-foreground font-mono">${formatCompact(totalMcap)}</div>
                </div>
              )}

              <button onClick={() => setView("create")}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/20 flex items-center gap-3 active:scale-[0.98] transition-all hover:border-green-500/30">
                <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center border border-green-500/20">
                  <Rocket className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-foreground">Launch New Token</div>
                  <div className="text-[10px] text-muted-foreground">Deploy on bonding curve · {CREATION_FEE} WLD</div>
                </div>
                <ChevronRight className="w-5 h-5 text-green-400" />
              </button>

              {myTokens.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Your Tokens</span>
                    <span className="text-[10px] text-muted-foreground">{myTokens.length} created</span>
                  </div>
                  <div className="space-y-2">
                    {myTokens.map(t => (
                      <TokenManageCard key={t.id} token={t} onSelect={(tok) => { setSelectedToken(tok); setView("manage"); setActiveTool(null); }} />
                    ))}
                  </div>
                </div>
              )}

              {myTokens.length === 0 && !tokensLoading && (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-secondary/30 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <div className="text-sm text-muted-foreground">Launch your first token</div>
                  <div className="text-[10px] text-muted-foreground/60">Create, manage, and grow your crypto project</div>
                </div>
              )}

              {tokensLoading && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-card/30 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />)}
                </div>
              )}
            </motion.div>
          )}

          {view === "create" && createStep === "form" && (
            <motion.div key="create-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-4">
                <button onClick={() => fileRef.current?.click()} data-testid="button-upload-avatar"
                  className="w-20 h-20 rounded-2xl bg-card/60 border-2 border-dashed border-border/50 flex items-center justify-center hover:border-green-500/50 transition-colors shrink-0 overflow-hidden">
                  {avatarPreview ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-muted-foreground" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                <div className="flex-1 space-y-2">
                  <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Token Name" data-testid="input-token-name"
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/30 transition-all" />
                  <input value={form.symbol} onChange={(e) => updateField("symbol", e.target.value.toUpperCase().slice(0, 8))} placeholder="SYMBOL (2-8 chars)" data-testid="input-token-symbol"
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/30 transition-all uppercase font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Emoji</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => updateField("emoji", e)} data-testid={`emoji-${e}`}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${form.emoji === e ? "bg-green-500/20 border-2 border-green-500 scale-110" : "bg-card/40 border border-border/30 hover:border-green-500/30"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your token (min 10 chars)..." rows={3} data-testid="input-description"
                  className="w-full p-3 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/30 resize-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Socials (optional)</label>
                <input value={form.twitter} onChange={(e) => updateField("twitter", e.target.value)} placeholder="Twitter/X handle" data-testid="input-twitter"
                  className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/30 transition-all" />
                <input value={form.telegram} onChange={(e) => updateField("telegram", e.target.value)} placeholder="Telegram link" data-testid="input-telegram"
                  className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/30 transition-all" />
                <input value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="Website URL" data-testid="input-website"
                  className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/30 transition-all" />
              </div>

              <div className="p-3 rounded-xl bg-yellow-500/8 border border-yellow-500/15">
                <div className="text-xs text-yellow-400 font-bold">Creation fee: {CREATION_FEE} WLD</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Paid via World App to launch your token</div>
              </div>

              {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-400 bg-red-500/8 border border-red-500/15 p-2.5 rounded-lg">{error}</motion.div>}

              <button onClick={handleCreateSubmit} data-testid="button-create-submit"
                className="w-full py-3.5 rounded-xl bg-green-500 text-white font-black text-sm active:scale-[0.97] transition-transform shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                <Rocket className="w-4 h-4" /> Launch Token
              </button>
            </motion.div>
          )}

          {view === "create" && createStep === "checking_orb" && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto" />
              <div className="text-xs font-medium text-muted-foreground">Checking ORB verification...</div>
            </motion.div>
          )}

          {view === "create" && createStep === "orb_required" && (
            <motion.div key="orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto border border-yellow-500/20">
                <ShieldAlert className="w-7 h-7 text-yellow-400" />
              </div>
              <div className="text-sm font-bold text-foreground">ORB Verification Required</div>
              <p className="text-[11px] text-muted-foreground px-6">Verify with World ID ORB in the main H app before creating tokens.</p>
              <button onClick={() => setCreateStep("form")} data-testid="button-back-form" className="text-xs text-green-400 font-bold">Go Back</button>
            </motion.div>
          )}

          {view === "create" && createStep === "paying" && (
            <motion.div key="paying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20">
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              </div>
              <div className="text-sm font-bold text-foreground">Confirm in World App</div>
              <p className="text-[11px] text-muted-foreground">Confirm the {CREATION_FEE} WLD payment</p>
              <button onClick={handleCancelPayment} data-testid="button-cancel-payment" className="text-xs text-red-400 font-bold">Cancel</button>
            </motion.div>
          )}

          {view === "create" && createStep === "creating" && (
            <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto" />
              <div className="text-xs font-medium text-foreground">Deploying {form.symbol}...</div>
              <p className="text-[10px] text-muted-foreground">Creating bonding curve</p>
            </motion.div>
          )}

          {view === "create" && createStep === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}>
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto border border-green-500/20">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>
              <div className="text-2xl">{form.emoji}</div>
              <div className="text-lg font-black text-foreground">{form.name}</div>
              <div className="text-xs text-muted-foreground">${form.symbol} is now live on the bonding curve</div>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={() => { closeCreatorDashboard(); if (createdTokenId) navigate("token", { tokenId: createdTokenId }); }} data-testid="button-view-token"
                  className="px-5 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform flex items-center gap-2">
                  View Token <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => { setCreateStep("form"); setView("hub"); }} data-testid="button-done"
                  className="px-5 py-2.5 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground">
                  Done
                </button>
              </div>
            </motion.div>
          )}

          {view === "manage" && !selectedToken && (
            <motion.div key="tokens-list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {myTokens.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <div className="text-sm text-muted-foreground">No tokens created yet</div>
                </div>
              ) : myTokens.map(t => (
                <TokenManageCard key={t.id} token={t} onSelect={(tok) => { setSelectedToken(tok); setActiveTool(null); }} />
              ))}
            </motion.div>
          )}

          {view === "manage" && selectedToken && !activeTool && (
            <motion.div key="token-tools" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card/40 border border-border/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 flex items-center justify-center text-xl border border-green-500/10 shrink-0">
                  {selectedToken.avatarUrl ? <img src={selectedToken.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" /> : selectedToken.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-foreground">{selectedToken.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{selectedToken.symbol} · {selectedToken.priceWld.toFixed(6)} WLD</div>
                </div>
                <button onClick={() => { closeCreatorDashboard(); navigate("token", { tokenId: selectedToken.id }); }}
                  className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <StatBox label="MCap" value={`$${formatCompact(selectedToken.marketCap)}`} icon={PieChart} color="text-green-400" />
                <StatBox label="Holders" value={formatCompact(selectedToken.holders)} icon={Users} color="text-blue-400" />
                <StatBox label="Locked" value={formatCompact(selectedToken.lockedSupply)} icon={Lock} color="text-cyan-400" />
                <StatBox label="Burned" value={formatCompact(selectedToken.burnedSupply)} icon={Flame} color="text-orange-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="stat-card items-center">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Total Supply</span>
                  <span className="text-xs font-bold text-foreground font-mono">{formatCompact(selectedToken.totalSupply)}</span>
                </div>
                <div className="stat-card items-center">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Circulating</span>
                  <span className="text-xs font-bold text-foreground font-mono">{formatCompact(selectedToken.circulatingSupply)}</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Token Tools</span>
              </div>

              <ToolCard icon={Lock} label="Lock Tokens" desc="Remove from circulation temporarily" color="bg-blue-500/10 text-blue-400" onClick={() => setActiveTool("lock")} />
              <ToolCard icon={Flame} label="Burn Tokens" desc="Permanently destroy supply" color="bg-orange-500/10 text-orange-400" onClick={() => setActiveTool("burn")} />
              <ToolCard icon={Gift} label="Create Airdrop" desc="Distribute tokens to verified users" color="bg-violet-500/10 text-violet-400" onClick={() => setActiveTool("airdrop")} />

              <div className="pt-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Bonding Curve</span>
              </div>
              <div className="p-3 rounded-xl bg-card/40 border border-border/20 space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-bold font-mono">{(selectedToken.curvePercent || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${Math.min(selectedToken.curvePercent || 0, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>{formatCompact(selectedToken.totalWldInCurve || 0)} WLD raised</span>
                  <span>2,000 WLD goal</span>
                </div>
                {selectedToken.graduated && (
                  <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
                    <Star className="w-3 h-3" /> Graduated to DEX
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === "manage" && selectedToken && activeTool === "lock" && (
            <motion.div key="lock-tool" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <LockPanel token={selectedToken} userId={user?.id ?? ""} onDone={() => { setActiveTool(null); loadCreatorTokens(); }} />
            </motion.div>
          )}

          {view === "manage" && selectedToken && activeTool === "burn" && (
            <motion.div key="burn-tool" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BurnPanel token={selectedToken} userId={user?.id ?? ""} onDone={() => { setActiveTool(null); loadCreatorTokens(); }} />
            </motion.div>
          )}

          {view === "manage" && selectedToken && activeTool === "airdrop" && (
            <motion.div key="airdrop-tool" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <AirdropPanel token={selectedToken} userId={user?.id ?? ""} onDone={() => { setActiveTool(null); loadCreatorTokens(); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

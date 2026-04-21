/**
 * derive.ts — Render helpers ÚNICAMENTE.
 *
 * Ley P1: prohibida cualquier lógica derivada del protocolo aquí.
 * Este archivo contiene solo formato visual (sin reglas económicas).
 * Todo lo que era "derivación" (curvePercent, graduationProgress) vive
 * ahora en el viewModel cocinado por el backend.
 */
import type { TotemProfile } from "../../lib/tradeApi";

// Emoji/symbol son decorativos. Son deterministas por address/name pero NO
// afectan ninguna regla del protocolo. Render puro.
const EMOJI_POOL = [
  "🔮","⚡","🌊","🔥","🌱","🛡️","🗝️","🪐","🌙","☀️",
  "🦊","🦉","🐉","🦄","🐺","🦅","🐙","🦋","🌸","💎",
];

function hashAddr(addr: string): number {
  let h = 0;
  const s = (addr || "0x0").toLowerCase();
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function deriveEmoji(addr: string): string {
  return EMOJI_POOL[hashAddr(addr) % EMOJI_POOL.length];
}

export function deriveSymbol(name: string): string {
  const w = (name || "").trim().split(/\s+/);
  if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
  return (name || "XX").slice(0, 3).toUpperCase();
}

export function formatUsd(n: number, d = 6): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(2)}K`;
  if (n >= 1)         return `$${n.toFixed(2)}`;
  return `$${n.toFixed(d)}`;
}

export function formatWld(n: number, d = 4): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M WLD`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K WLD`;
  return `${n.toFixed(d)} WLD`;
}

export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.floor(n)}`;
}

export function shortAddr(a: string): string {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

/**
 * Decorativos solamente — emoji + symbol. Sin curvePercent (que inventaba
 * una regla de graduación falsa). La progresión real de graduación vive
 * en viewModel.progression.graduation.
 */
export interface Enriched extends TotemProfile {
  emoji:  string;
  symbol: string;
}
export type Decorated = Enriched;

export function enrich(t: TotemProfile): Enriched {
  return {
    ...t,
    emoji:  deriveEmoji(t.address),
    symbol: deriveSymbol(t.name),
  };
}

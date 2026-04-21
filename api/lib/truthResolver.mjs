/**
 * truthResolver.mjs — Orquesta la lectura canónica para el viewModel.
 *
 * Pipeline:
 *   getRaw(address, userId)
 *     → { onchain, indexed, db, fetchedAt }
 *
 * Reglas duras:
 *   - NO compone viewModel (eso es viewModelBuilder). Solo resuelve fuentes.
 *   - Tolerante a RPC no configurado: si falta env RPC_URL, devuelve
 *     onchain = {} y el builder marca todos los campos onchain_only como stale.
 *   - Timestamps siempre en segundos UNIX (BigInt-compatibles).
 *
 * Ley A2 + A3: cada fuente devuelve su propio `fetchedAt` para que el SLA
 * por subdominio pueda evaluarse por separado.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

// ════════════════════════════════════════════════════════════════════════════
// RPC lazy loader — nunca crash si RPC_URL falta. Simplemente devuelve null.
// ════════════════════════════════════════════════════════════════════════════

let _rpcProvider = null;
let _rpcTried = false;

async function getProvider() {
  if (_rpcTried) return _rpcProvider;
  _rpcTried = true;
  try {
    if (!process.env.RPC_URL) return null;
    const { ethers } = await import("ethers");
    _rpcProvider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    return _rpcProvider;
  } catch (e) {
    console.warn("[truthResolver] RPC provider unavailable:", e?.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Indexed source — Supabase `totems` (mirror de eventos)
// ════════════════════════════════════════════════════════════════════════════

async function readIndexed(address) {
  try {
    const { data, error } = await supabase
      .from("totems")
      .select("address, name, owner, score, influence, level, badge, price, supply, volume_24h, created_at")
      .eq("address", address)
      .maybeSingle();
    if (error || !data) return null;
    return {
      name:       data.name ?? null,
      owner:      data.owner ?? null,
      score:      data.score != null ? Number(data.score) : null,
      influence:  data.influence != null ? Number(data.influence) : null,
      level:      data.level != null ? Number(data.level) : null,
      badge:      data.badge ?? null,
      price:      data.price != null ? Number(data.price) : null,
      supply:     data.supply != null ? Number(data.supply) : null,
      rawVolume:  data.volume_24h != null ? Number(data.volume_24h) : null,
      createdAt:  data.created_at ? Math.floor(new Date(data.created_at).getTime() / 1000) : null,
    };
  } catch (e) {
    console.error("[truthResolver] indexed error:", e?.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DB metadata source — name/owner/created_at del Registry off-chain
// ════════════════════════════════════════════════════════════════════════════

async function readDbMeta(address) {
  const i = await readIndexed(address);
  if (!i) return null;
  return { name: i.name, owner: i.owner, createdAt: i.createdAt };
}

// ════════════════════════════════════════════════════════════════════════════
// User context — balance / sold-in-window desde trades DB
// ════════════════════════════════════════════════════════════════════════════

async function readUserContext(address, userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("trades")
      .select("type, tokens, timestamp")
      .eq("totem", address)
      .eq("user", userId);
    if (error || !data) return null;
    let balance = 0;
    let soldInWindow = 0;
    const windowStart = Math.floor(Date.now() / 1000) - 86400;
    for (const t of data) {
      const tokens = Number(t.tokens ?? 0);
      if (t.type === "buy")  balance += tokens;
      if (t.type === "sell") {
        balance -= tokens;
        const ts = Math.floor(new Date(t.timestamp).getTime() / 1000);
        if (ts >= windowStart) soldInWindow += tokens;
      }
    }
    return { balance: Math.max(0, balance), soldInWindow };
  } catch (e) {
    console.error("[truthResolver] userContext error:", e?.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Onchain source — batch RPC reads (tolerante a RPC ausente)
// ════════════════════════════════════════════════════════════════════════════

async function readOnchain(_address, _userId) {
  const provider = await getProvider();
  if (!provider) return {};
  // En deploy real este bloque hace multicall contra:
  //   Registry.isTotem, Registry.isBlocked
  //   Attestation.isHuman
  //   Tótem.status (level, badge, fraudLocked)
  //   BondingCurve.realSupply, balances, sellWindows, frozen
  //   MarketMetrics.markets (raw/verified/createdAt/lastTradeAt)
  //   Oracle.getMetrics (score/influence/timestamp)
  //   GraduationManager.graduated / ammPair
  //   Governance.emergencyMode
  //   HumanTotem.getHumanHealth / symbol / totalSupply
  //   Credits.credits
  //   RateLimiter.windowUsed
  //
  // Sin deploy contracts activo: devuelve {} y el builder marca onchain_only
  // fields como missing/stale (comportamiento honesto vs inventar datos).
  return {};
}

// ════════════════════════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════════════════════════

/**
 * @returns {{
 *   onchain: object, indexed: object | null, db: object | null,
 *   userContext: object | null,
 *   fetchedAt: { onchain: number|null, indexed: number, db: number, userContext: number|null },
 *   nowSec: number,
 * }}
 */
export async function getRaw(address, userId) {
  const nowSec = Math.floor(Date.now() / 1000);
  const [onchain, indexed, db, userContext] = await Promise.all([
    readOnchain(address, userId),
    readIndexed(address),
    readDbMeta(address),
    readUserContext(address, userId),
  ]);
  return {
    onchain,
    indexed,
    db,
    userContext,
    fetchedAt: {
      onchain:     Object.keys(onchain || {}).length ? nowSec : null,
      indexed:     indexed ? nowSec : null,
      db:          db ? nowSec : null,
      userContext: userContext ? nowSec : null,
    },
    nowSec,
  };
}

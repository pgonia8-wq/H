/**
 * graduate-execute.mjs — Verificador de graduación on-chain
 *
 * MIRROR-ONLY: el guard server-side replica el orden EXACTO de checks de
 * graduate() en TotemGraduationManager.sol vía lib/graduation.mjs::graduateGuard.
 * NO se inventan reglas, NO se simplifica el orden de revert.
 *
 * MODO DEV (GRADUATION_MANAGER_ADDRESS no configurada):
 *   - Exige txHash con prefijo "0xdev" (anti-confusión con hash real)
 *   - Re-aplica graduateGuard server-side (defensa: el frontend no es de fiar)
 *   - NO escribe DB: la columna/tabla de graduación todavía no está asegurada.
 *     Cuando exista, este endpoint debe insertar en `totem_graduations` con
 *     UNIQUE (totem, tx_hash) para anti-replay.
 *   - Devuelve {ok:true, mode:"simulation"}
 *
 * MODO PROD (GRADUATION_MANAGER_ADDRESS configurada):
 *   - TODO: receipt + decode evento Graduated(address user) + persistencia
 *           con anti-replay. Stub explícito hasta que el contrato esté deployado.
 *
 * Solo Orb-verified puede ejecutar (requireOrbSession).
 */

import { createClient }            from "@supabase/supabase-js";
import { requireOrbSession }       from "../_orbGuard.mjs";
import { graduateGuard, calcLiquidityAmounts, GraduationError } from "../lib/graduation.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GRADUATION_MGR_ADDR = (process.env.GRADUATION_MANAGER_ADDRESS || "").toLowerCase().trim();
const IS_PRODUCTION       = GRADUATION_MGR_ADDR.length === 42 && GRADUATION_MGR_ADDR.startsWith("0x");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Método no permitido" });

  // ── 1. Sesión + Orb (idéntico a market/execute.mjs) ───────────────────────
  const guard = await requireOrbSession(supabase, req);
  if (!guard.ok) {
    return res.status(guard.status).json({ error: guard.error, code: guard.code });
  }
  const userId        = guard.user.userId;
  const walletAddress = guard.user.walletAddress;

  // ── 2. Validación de inputs ──────────────────────────────────────────────
  const { txHash, totemAddress } = req.body ?? {};

  if (!txHash || typeof txHash !== "string" || txHash.length < 8) {
    return res.status(400).json({ error: "txHash inválido" });
  }
  if (!totemAddress || !/^0x[0-9a-fA-F]{40}$/.test(totemAddress)) {
    return res.status(400).json({ error: "totemAddress inválido" });
  }
  const totemLower = totemAddress.toLowerCase();

  // ── 3. Leer estado del totem ─────────────────────────────────────────────
  const { data: totem, error: dbErr } = await supabase
    .from("totems")
    .select("address, supply, level, price, created_at, volume_24h, owner")
    .eq("address", totemLower)
    .single();

  if (dbErr || !totem) {
    return res.status(404).json({ error: "Totem no encontrado en DB" });
  }

  // Política protocolo: solo el owner del totem puede graduarlo.
  // El contrato lo enforza on-chain (graduate(user) requiere user==msg.sender
  // en la mayoría de implementaciones). Espejamos la regla aquí.
  if ((totem.owner ?? "").toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(403).json({
      error: "Solo el owner del totem puede graduar",
      code:  "NOT_OWNER",
    });
  }

  // ── 4. Construir inputs BigInt y aplicar guard mirror ────────────────────
  const supplyBI    = BigInt(Math.max(0, Math.floor(Number(totem.supply ?? 0))));
  const levelBI     = BigInt(Math.max(0, Math.floor(Number(totem.level  ?? 0))));
  const priceBI     = BigInt(Math.max(0, Math.floor(Number(totem.price  ?? 0))));
  const createdAtSec = totem.created_at
    ? BigInt(Math.floor(new Date(totem.created_at).getTime() / 1000))
    : 0n;
  const verifiedVolumeWei = BigInt(
    Math.max(0, Math.floor(Number(totem.volume_24h ?? 0) * 1e18))
  );
  const nowSec = BigInt(Math.floor(Date.now() / 1000));

  // alreadyGraduated: leer de DB (totem_graduations) — defensa server-side.
  // Si la tabla aún no existe (migration_11 no aplicada) caemos en
  // gradTableMissing y bloqueamos la ejecución (NO permitimos graduar a
  // ciegas porque no sabríamos si ya pasó).
  let alreadyGraduated = false;
  let gradTableMissing = false;
  {
    const { data: gradRow, error: gradErr } = await supabase
      .from("totem_graduations")
      .select("totem")
      .eq("totem", totemLower)
      .maybeSingle();
    if (gradErr) {
      if (gradErr.code === "42P01" || /relation .* does not exist/i.test(gradErr.message ?? "")) {
        gradTableMissing = true;
      } else {
        return res.status(500).json({ error: "Error consultando graduaciones", detail: gradErr.message });
      }
    } else {
      alreadyGraduated = !!gradRow;
    }
  }

  if (gradTableMissing) {
    return res.status(503).json({
      error: "Tabla totem_graduations no existe — aplicar migration_11_totem_graduations.sql en Supabase",
      code:  "MIGRATION_PENDING",
    });
  }

  try {
    graduateGuard({
      alreadyGraduated,
      fraudLocked:      false,   // DEV: asumido. PROD: leer contrato.
      level:            levelBI,
      supply:           supplyBI,
      createdAt:        createdAtSec,
      verifiedVolume:   verifiedVolumeWei,
      now:              nowSec,
    });
  } catch (e) {
    if (e instanceof GraduationError) {
      return res.status(409).json({
        error: "Guard de graduación falló",
        code:  e.code,
        reason: e.reason ?? null,
      });
    }
    return res.status(500).json({ error: "Error en mirror graduación", detail: e.message });
  }

  // ── 5. Modo PROD vs DEV ──────────────────────────────────────────────────
  if (IS_PRODUCTION) {
    return res.status(501).json({
      error: "PROD wiring pendiente: lectura de receipt + evento Graduated(user) no implementada",
      code:  "PROD_NOT_WIRED",
      hint:  "Implementar verifyOnChain análogo a market/execute.mjs::verifyOnChain cuando TotemGraduationManager esté deployado",
    });
  }

  // ── DEV: txHash con prefijo "0xdev" (anti-confusión con hash real) ───────
  if (!txHash.startsWith("0xdev")) {
    return res.status(400).json({
      error: "En modo simulación el txHash debe empezar con '0xdev'",
      hint:  "Configura GRADUATION_MANAGER_ADDRESS=0x... para activar producción",
    });
  }

  // ── DEV: persistir en totem_graduations con anti-replay ──────────────────
  // Snapshot del cálculo de liquidez (mirror) para auditoría posterior.
  let liqSnap = null;
  try {
    const liq = calcLiquidityAmounts({ supply: supplyBI, price: priceBI });
    liqSnap = {
      liquidity_token: liq.amountToken.toString(),
      liquidity_wld:   liq.amountWLD.toString(),
    };
  } catch (e) {
    if (!(e instanceof GraduationError)) throw e;
    // Si NoSupply aquí es bug aguas arriba (guard ya validó MIN_SUPPLY),
    // dejamos liqSnap=null y reportamos el motivo en la fila.
  }

  const { data: inserted, error: insErr } = await supabase
    .from("totem_graduations")
    .insert({
      totem:           totemLower,
      user_id:         userId,
      wallet:          walletAddress,
      tx_hash:         txHash.toLowerCase(),
      mode:            "simulation",
      liquidity_token: liqSnap?.liquidity_token ?? null,
      liquidity_wld:   liqSnap?.liquidity_wld   ?? null,
    })
    .select("id, created_at")
    .single();

  if (insErr) {
    if (insErr.code === "23505") {
      // UNIQUE violation: totem ya graduado o tx_hash repetido
      const dupField = /tx_hash/i.test(insErr.message) ? "tx_hash" : "totem";
      return res.status(409).json({
        error: dupField === "tx_hash"
          ? "Esta transacción ya fue procesada (anti-replay)"
          : "Este tótem ya fue graduado",
        code:  dupField === "tx_hash" ? "TX_REPLAY" : "ALREADY_GRADUATED",
      });
    }
    return res.status(500).json({ error: "Error al persistir graduación", detail: insErr.message });
  }

  return res.status(200).json({
    ok:           true,
    mode:         "simulation",
    totem:        totemLower,
    user:         userId,
    wallet:       walletAddress,
    txHash,
    graduationId: inserted.id,
    persistedAt:  inserted.created_at,
    liquidity:    liqSnap,
  });
}

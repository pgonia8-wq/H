/**
 * graduate-preview.mjs — Preview ADVISORY de graduación
 *
 * MIRROR-ONLY: TODA la lógica de elegibilidad y math de liquidez la resuelve
 * lib/graduation.mjs (mirror BigInt EXACTO de TotemGraduationManager.sol).
 * Este endpoint NO inventa thresholds, NO recalcula gaps, NO toca constantes.
 *
 * MODO DEV (GRADUATION_MANAGER_ADDRESS no configurada):
 *   - verifiedVolume se DERIVA de totems.volume_24h (proxy advisory)
 *   - fraudLocked = false (asumido)
 *   - alreadyGraduated = false (asumido)
 *   - El response viene marcado advisory:true para que la UI lo señale
 *
 * MODO PROD (GRADUATION_MANAGER_ADDRESS configurada):
 *   - TODO: leer verifiedVolume, fraudLocked, graduated[user] del contrato.
 *           Cuando esté deployado, esto se cablea aquí. Por ahora devuelve
 *           advisory con un warning explícito.
 *
 * RESPONSE: BigInt → string (JSON.stringify no soporta BigInt nativo).
 */

import { createClient }      from "@supabase/supabase-js";
import { graduationPreview, calcLiquidityAmounts, GraduationError } from "../lib/graduation.mjs";
import { Graduation as G }   from "../lib/protocolConstants.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Feature flag igual que market/execute.mjs
const GRADUATION_MGR_ADDR = (process.env.GRADUATION_MANAGER_ADDRESS || "").toLowerCase().trim();
const IS_PRODUCTION       = GRADUATION_MGR_ADDR.length === 42 && GRADUATION_MGR_ADDR.startsWith("0x");

// Serializa todos los BigInt de un objeto a string (para JSON safe)
function serializeBigInts(value) {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value))      return value.map(serializeBigInts);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = serializeBigInts(v);
    return out;
  }
  return value;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Método no permitido" });

  const { totem } = req.body ?? {};
  if (!totem || typeof totem !== "string") {
    return res.status(400).json({ error: "totem (address) requerido" });
  }

  const totemLower = totem.toLowerCase();

  // ── 1. Leer estado del totem en DB ───────────────────────────────────────
  const { data: totemData, error: dbErr } = await supabase
    .from("totems")
    .select("address, supply, level, price, volume_24h, created_at")
    .eq("address", totemLower)
    .single();

  if (dbErr || !totemData) {
    return res.status(404).json({ error: "Totem no encontrado en DB" });
  }

  // ── 2. Construir inputs BigInt para el mirror ────────────────────────────
  // Defensa contra valores nulos/floats: cast explícito y truncamiento.
  const supplyBI    = BigInt(Math.max(0, Math.floor(Number(totemData.supply ?? 0))));
  const levelBI     = BigInt(Math.max(0, Math.floor(Number(totemData.level  ?? 0))));
  const priceBI     = BigInt(Math.max(0, Math.floor(Number(totemData.price  ?? 0))));

  const createdAtSec = totemData.created_at
    ? BigInt(Math.floor(new Date(totemData.created_at).getTime() / 1000))
    : 0n;

  // verifiedVolume: en DEV, se deriva de volume_24h (en WLD float) → wei.
  // ADVERTENCIA: esto es un PROXY advisory, no es el verifiedVolume real
  // del contrato (que solo cuenta trades anti-wash post-Oracle). En PROD
  // hay que leerlo del contrato Metrics.markets(user).verifiedVolume.
  const verifiedVolumeWei = BigInt(
    Math.max(0, Math.floor(Number(totemData.volume_24h ?? 0) * 1e18))
  );

  // alreadyGraduated: leer de DB (totem_graduations). Si la tabla aún no
  // existe (migration_11 no aplicada) la query falla silenciosamente y
  // se asume false con warning.
  let alreadyGraduated = false;
  let gradTableMissing = false;
  {
    const { data: gradRow, error: gradErr } = await supabase
      .from("totem_graduations")
      .select("totem")
      .eq("totem", totemLower)
      .maybeSingle();
    if (gradErr) {
      // 42P01 = undefined_table en Postgres
      if (gradErr.code === "42P01" || /relation .* does not exist/i.test(gradErr.message ?? "")) {
        gradTableMissing = true;
      } else {
        return res.status(500).json({ error: "Error consultando graduaciones", detail: gradErr.message });
      }
    } else {
      alreadyGraduated = !!gradRow;
    }
  }

  // fraudLocked: en DEV asumido false. En PROD se lee del contrato Status.
  const fraudLocked = false;

  const nowSec = BigInt(Math.floor(Date.now() / 1000));

  // ── 3. Mirror call ────────────────────────────────────────────────────────
  let preview;
  try {
    preview = graduationPreview({
      alreadyGraduated,
      fraudLocked,
      level:           levelBI,
      supply:          supplyBI,
      createdAt:       createdAtSec,
      verifiedVolume:  verifiedVolumeWei,
      now:             nowSec,
    });
  } catch (e) {
    return res.status(500).json({ error: "Error en mirror graduación", detail: e.message });
  }

  // ── 4. Si elegible, calcular liquidez AMM (mirror calcLiquidityAmounts) ──
  let liquidity = null;
  if (preview.eligible) {
    try {
      liquidity = calcLiquidityAmounts({ supply: supplyBI, price: priceBI });
    } catch (e) {
      // NoSupply no debería ocurrir si pasó el check de MIN_SUPPLY, pero
      // defendemos por si alguna semilla DB rompe la invariant.
      if (e instanceof GraduationError) {
        liquidity = { error: e.code, reason: e.reason };
      } else {
        throw e;
      }
    }
  }

  // ── 5. Response (BigInt → string) ────────────────────────────────────────
  const warnings = [];
  if (!IS_PRODUCTION) {
    warnings.push("DEV mode: verifiedVolume derivado de volume_24h (proxy)");
    warnings.push("DEV mode: fraudLocked asumido false");
  } else {
    warnings.push("PROD wiring pendiente: GRADUATION_MANAGER_ADDRESS configurada pero contrato aún no consultado");
  }
  if (gradTableMissing) {
    warnings.push("totem_graduations no existe — aplicar migration_11_totem_graduations.sql en Supabase");
  }

  return res.status(200).json({
    advisory:  true,
    mode:      IS_PRODUCTION ? "production-stub" : "simulation",
    totem:     totemLower,
    eligible:  preview.eligible,
    reason:    preview.reason,
    gaps:      serializeBigInts(preview.gaps),
    liquidity: liquidity ? serializeBigInts(liquidity) : null,
    constants: {
      MIN_LEVEL:       G.MIN_LEVEL.toString(),
      MIN_SUPPLY:      G.MIN_SUPPLY.toString(),
      MIN_VOLUME_WEI:  G.MIN_VOLUME_WEI.toString(),
      MIN_AGE_SEC:     G.MIN_AGE_SEC.toString(),
      LIQUIDITY_BPS:   G.LIQUIDITY_BPS.toString(),
      BPS_DENOMINATOR: G.BPS_DENOMINATOR.toString(),
    },
    warnings,
  });
}

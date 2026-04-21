/**
 * GET /api/admin/contracts — Lista canónica de los 20 contratos del protocolo
 * con su estado de wiring. Incluye IntentRouter marcado DRAFT (no wired).
 *
 * Gated por x-admin-key (ADMIN_SECRET). Read-only.
 *
 * Ley: NO incluye `TotemIntentRouter` en el viewModel builder ni en truthResolver.
 * Solo aparece aquí listado como referencia para el admin.
 */

import { adminAuth, cors } from "./_auth.mjs";

const CONTRACTS = [
  { id: "C1",  name: "TotemBondingCurve",          role: "trading",        status: "WIRED",   envVar: "CURVE_ADDRESS",           mirror: "curve.mjs" },
  { id: "C2",  name: "TotemOracle",                 role: "metrics",        status: "WIRED",   envVar: "ORACLE_ADDRESS",          mirror: "oracleSigner.mjs" },
  { id: "C3",  name: "TotemMarketMetrics",          role: "volumen",        status: "WIRED",   envVar: "MARKET_METRICS_ADDRESS",  mirror: "protocolConstants.mjs#MarketMetrics" },
  { id: "C4",  name: "TotemStabilityModule",        role: "estabilidad",    status: "WIRED",   envVar: "STABILITY_ADDRESS",       mirror: "stability.mjs" },
  { id: "C5",  name: "TotemAntiManipulationLayer",  role: "anti-manip",     status: "WIRED",   envVar: "ANTI_MANIP_ADDRESS",      mirror: "antiManipulation.mjs" },
  { id: "C6",  name: "TotemRateLimiter",            role: "rate-limit",     status: "WIRED",   envVar: "RATE_LIMITER_ADDRESS",    mirror: "rateLimiter.mjs" },
  { id: "C7",  name: "TotemRegistry",               role: "identidad",      status: "WIRED",   envVar: "REGISTRY_ADDRESS",        mirror: "protocolConstants.mjs#Registry" },
  { id: "C8",  name: "HumanTotem",                  role: "token graduado", status: "WIRED",   envVar: "HUMAN_TOTEM_ADDRESS",     mirror: "humanTotemFees.mjs" },
  { id: "C9",  name: "Tótem",                       role: "soulbound avatar", status: "WIRED", envVar: "TOTEM_ADDRESS",           mirror: "totemSync.mjs" },
  { id: "C10", name: "TotemAccessGateway",          role: "paid queries",   status: "WIRED",   envVar: "ACCESS_GATEWAY_ADDRESS",  mirror: "protocolConstants.mjs#AccessGateway" },
  { id: "C11", name: "TotemAttestation",            role: "humanidad",      status: "WIRED",   envVar: "ATTESTATION_ADDRESS",     mirror: "protocolConstants.mjs#Attestation" },
  { id: "C12", name: "TotemControl",                role: "admin fees",     status: "WIRED",   envVar: "CONTROL_ADDRESS",         mirror: "protocolConstants.mjs#TotemControl" },
  { id: "C13", name: "TotemCoreRouter",             role: "fast path",      status: "WIRED",   envVar: "CORE_ROUTER_ADDRESS",     mirror: null },
  { id: "C14", name: "TotemCredits",                role: "créditos UX",    status: "WIRED",   envVar: "CREDITS_ADDRESS",         mirror: null },
  { id: "C15", name: "TotemFeeRouter",              role: "splits",         status: "WIRED",   envVar: "FEE_ROUTER_ADDRESS",      mirror: "feeRouter.mjs" },
  { id: "C16", name: "TotemGovernance",             role: "timelock",       status: "WIRED",   envVar: "GOVERNANCE_ADDRESS",      mirror: "protocolConstants.mjs#Governance" },
  { id: "C17", name: "TotemGraduationManager",      role: "graduación",     status: "WIRED",   envVar: "GRADUATION_ADDRESS",      mirror: "graduation.mjs" },
  { id: "C18", name: "TotemReader",                 role: "batch reader",   status: "WIRED",   envVar: "READER_ADDRESS",          mirror: null },
  { id: "C19", name: "TotemTreasury",               role: "hold fees",      status: "WIRED",   envVar: "TREASURY_ADDRESS",        mirror: "protocolConstants.mjs#Treasury" },
  { id: "C20", name: "TotemIntentRouter",           role: "intents EIP-712",status: "DRAFT",   envVar: null,                       mirror: null, note: "Uses registry.totalSupply() that doesn't exist in current Registry. NOT wired into viewModel/truthResolver." },
];

export default async function handler(req, res) {
  cors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!adminAuth(req, res)) return;
  return res.status(200).json({
    protocolVersion: "0.2.0",
    total: CONTRACTS.length,
    wired: CONTRACTS.filter(c => c.status === "WIRED").length,
    draft: CONTRACTS.filter(c => c.status === "DRAFT").length,
    contracts: CONTRACTS.map(c => ({
      ...c,
      deployed: c.envVar ? !!process.env[c.envVar] : false,
      address:  c.envVar ? (process.env[c.envVar] || null) : null,
    })),
  });
}

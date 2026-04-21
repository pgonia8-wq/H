/**
 * GET /api/totem/viewModel?address=<0x...>&userId=<id>
 *
 * Canonical view model del tótem. Frontier única entre backend y shell.
 * Frontend renderiza sin derivación propia (P1). Composición puramente
 * determinista en viewModelBuilder (A4). Prioridad RPC→indexer→DB (A3).
 * SLA por subdominio (A2). Versionado por módulo (A1).
 */

import { getRaw } from "../lib/truthResolver.mjs";
import { compose } from "../lib/viewModelBuilder.mjs";

// Cache en memoria 5s por address+userId para evitar hammering del RPC.
const CACHE_TTL_MS = 5000;
const cache = new Map();

function cacheKey(address, userId) {
  return `${address}::${userId || ""}`;
}

export default async function handler(req, res) {
  try {
    const address = String(req.query?.address ?? "").toLowerCase().trim();
    const userId  = String(req.query?.userId  ?? "").trim();
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return res.status(400).json({ error: "address inválida" });
    }

    const key = cacheKey(address, userId);
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
      res.setHeader("x-vm-cache", "hit");
      return res.status(200).json(hit.data);
    }

    const raw = await getRaw(address, userId);
    raw.address = address;
    const viewModel = compose(raw);

    // Si no hay indexed ni onchain, devolvemos 404 (tótem desconocido).
    if (!raw.indexed && !raw.db && !Object.keys(raw.onchain || {}).length) {
      return res.status(404).json({ error: "Totem no encontrado" });
    }

    cache.set(key, { ts: Date.now(), data: viewModel });
    res.setHeader("x-vm-cache", "miss");
    return res.status(200).json(viewModel);
  } catch (err) {
    console.error("[/api/totem/viewModel] unhandled:", err);
    return res.status(500).json({ error: err?.message ?? "internal error" });
  }
}

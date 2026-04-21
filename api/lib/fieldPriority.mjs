/**
 * fieldPriority.mjs — Prioridad de fuente POR CAMPO (no por fuente global).
 *
 * Ley A3 de la reforma viewModel. Fuentes:
 *   1. "onchain"  — RPC directo al contrato (canónica)
 *   2. "indexed"  — Supabase indexer de eventos on-chain
 *   3. "db"       — Metadata humana (name, owner, created_at del registry)
 *
 * Políticas por campo:
 *   - onchain_only       → si RPC falla, campo = null + source:"onchain" + stale:true
 *   - onchain_preferred  → si RPC falla, fallback a indexed
 *   - indexed_preferred  → indexer primero (más eficiente para agregados)
 *   - indexed_only       → solo indexer (RPC no escala: holders, trades, history)
 *   - db                 → solo DB (metadata)
 *   - onchain_or_db      → symbol: on-chain si graduado, DB si no
 */

export const FIELD_POLICY = Object.freeze({
  // identity
  "identity.name":             "db",
  "identity.owner":            "db",
  "identity.symbol":           "onchain_or_db",

  // status — flags críticas, sin fallback
  "status.graduated":          "onchain_only",
  "status.ammPair":            "onchain_only",
  "status.fraudLocked":        "onchain_only",
  "status.frozen":             "onchain_only",
  "status.emergencyMode":      "onchain_only",
  "status.isHuman":            "onchain_only",
  "status.isTotem":            "onchain_only",

  // oracle — firmado, sin fallback
  "oracle.score":              "onchain_only",
  "oracle.influence":          "onchain_only",
  "oracle.signedAt":           "onchain_only",

  // market
  "market.price":              "onchain_only",
  "market.supply":             "onchain_preferred",
  "market.rawVolume":          "indexed_preferred",
  "market.verifiedVolume":     "onchain_only",
  "market.createdAt":          "onchain_preferred",
  "market.lastTradeAt":        "indexed_preferred",

  // progression
  "progression.totalScoreAccumulated": "onchain_preferred",
  "progression.negativeEvents":        "onchain_preferred",
  "progression.level":                 "onchain_preferred",
  "progression.badge":                 "onchain_preferred",

  // userContext
  "userContext.balance":          "onchain_preferred",
  "userContext.sellWindowUsed":   "onchain_preferred",
  "userContext.credits":          "onchain_preferred",

  // trading — constants son locales (mirrors), no requieren fuente
  "trading.buyFeeBps":            "mirror",
  "trading.sellFeeBps":           "mirror",
  "trading.ownerCapBps":          "mirror",
  "trading.userCapBps":           "mirror",
  "trading.humanTotemFeeBps":     "onchain_preferred",
  "trading.rateLimit":            "onchain_preferred",
});

/**
 * Resuelve la fuente final según política y disponibilidad.
 * @returns { value, source, stale, missing }
 */
export function resolveField(path, { onchain, indexed, db, isGraduated = false }) {
  const policy = FIELD_POLICY[path] ?? "onchain_preferred";

  const has = (x) => x !== undefined && x !== null;

  switch (policy) {
    case "mirror":
      return { value: onchain, source: "mirror", stale: false, missing: !has(onchain) };
    case "db":
      return { value: db, source: "db", stale: false, missing: !has(db) };
    case "onchain_only":
      return has(onchain)
        ? { value: onchain, source: "onchain", stale: false, missing: false }
        : { value: null,    source: "onchain", stale: true,  missing: true };
    case "onchain_preferred":
      if (has(onchain)) return { value: onchain, source: "onchain", stale: false, missing: false };
      if (has(indexed)) return { value: indexed, source: "indexed", stale: true,  missing: false };
      if (has(db))      return { value: db,      source: "db",      stale: true,  missing: false };
      return { value: null, source: "onchain", stale: true, missing: true };
    case "indexed_preferred":
      if (has(indexed)) return { value: indexed, source: "indexed", stale: false, missing: false };
      if (has(onchain)) return { value: onchain, source: "onchain", stale: false, missing: false };
      return { value: null, source: "indexed", stale: true, missing: true };
    case "indexed_only":
      return has(indexed)
        ? { value: indexed, source: "indexed", stale: false, missing: false }
        : { value: null,    source: "indexed", stale: true,  missing: true };
    case "onchain_or_db":
      if (isGraduated && has(onchain)) return { value: onchain, source: "onchain", stale: false, missing: false };
      if (has(db))                     return { value: db,      source: "db",      stale: false, missing: false };
      return { value: null, source: "db", stale: true, missing: true };
    default:
      return { value: null, source: "unknown", stale: true, missing: true };
  }
}

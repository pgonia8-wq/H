import { getUxHints } from "./_infra.mjs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const hints = getUxHints();

  return res.status(200).json({
    feedRefreshMs: hints.feedRefreshMs,
    realtimeEnabled: hints.realtimeActive,
    showLoadingBanner: hints.systemState !== "NORMAL",
    retryAfterMs: hints.systemState === "HARD_SAFE" ? 30000 :
                  hints.systemState === "LOCKDOWN" ? 15000 :
                  hints.systemState === "STABILIZATION" ? 10000 :
                  hints.systemState === "CRITICAL" ? 5000 : null,
    tradingAvailable: hints.tradingAvailable,
    socialAvailable: hints.socialAvailable,
    systemState: hints.systemState,
    gpi: hints.gpi,
    messages: hints.messages,
  });
}

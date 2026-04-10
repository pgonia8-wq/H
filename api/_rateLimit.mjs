import { createClient } from "@supabase/supabase-js";

  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  const hits = new Map();
  const CLEANUP_INTERVAL = 5 * 60 * 1000;
  let lastCleanup = Date.now();

  function cleanup(windowMs) {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, record] of hits) {
      if (now - record.start > windowMs * 2) hits.delete(key);
    }
  }

  export function rateLimit(req, { windowMs = 60000, max = 60 } = {}) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const now = Date.now();
    cleanup(windowMs);

    const record = hits.get(ip);
    if (!record || now - record.start > windowMs) {
      hits.set(ip, { start: now, count: 1 });
      return { limited: false };
    }
    record.count++;
    if (record.count > max) {
      return { limited: true };
    }
    return { limited: false };
  }

  export async function rateLimitPersistent(key, { windowMs = 60000, max = 30 } = {}) {
    try {
      const since = new Date(Date.now() - windowMs).toISOString();
      const { count, error } = await supabase
        .from("rate_limit_hits")
        .select("id", { count: "exact", head: true })
        .eq("key", key)
        .gte("created_at", since);

      if (error) {
        console.error("[RATE_LIMIT] DB error:", error.message);
        return { limited: false };
      }

      if ((count ?? 0) >= max) {
        return { limited: true };
      }

      await supabase.from("rate_limit_hits").insert({
        key,
        created_at: new Date().toISOString(),
      });

      return { limited: false };
    } catch (err) {
      console.error("[RATE_LIMIT] Error:", err.message);
      return { limited: false };
    }
  }
  
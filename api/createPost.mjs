import { createClient } from "@supabase/supabase-js";
  import { rateLimitPersistent } from "./_rateLimit.mjs";
  import { canSocialWrite, shouldQueueSocial, shouldThrottle, isRealtimeEnabled } from "./_infra.mjs";
  import { smartRateLimit } from "./_smartRate.mjs";
  import { createTrace, startSpan, endSpan, finishTrace, log, SPANS, LOG_TYPES } from "./_tracer.mjs";
  import { enqueue, OP_TYPES } from "./_queue.mjs";
  import { trackRequest, trackPost, isReadOnlyMode } from "./_metrics.mjs";

  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  function sanitizeContent(text) {
    return text
      .replace(/<script[^>]*>[sS]*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>[sS]*?<\/iframe>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/<(?!\/?(b|i|u|em|strong|br|p)\b)[^>]+>/gi, "")
      .trim();
  }

  export default async function handler(req, res) {
    const t0 = Date.now();
    const reqId = Math.random().toString(36).slice(2, 10);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const body = req.body ?? {};
    const user_id = body.user_id || body.userId;
    const { content, image_url } = body;

    const trace = createTrace("/api/createPost", user_id);
    startSpan(trace, SPANS.REQUEST_START);

    console.log(JSON.stringify({ event: "create_post", reqId, traceId: trace.traceId, userId: user_id, content_length: content?.length, ts: new Date().toISOString() }));

    if (!user_id || typeof user_id !== "string") {
      finishTrace(trace, "error");
      return res.status(400).json({ error: "user_id required" });
    }

    if (isReadOnlyMode()) {
      finishTrace(trace, "blocked");
      log(trace, SPANS.REQUEST_START, LOG_TYPES.INFRA, "503", { reason: "read_only_mode" });
      return res.status(503).json({ error: "System is in read-only mode" });
    }
    if (!canSocialWrite()) {
      finishTrace(trace, "blocked");
      log(trace, SPANS.REQUEST_START, LOG_TYPES.INFRA, "503", { reason: "social_writes_disabled" });
      return res.status(503).json({ error: "Social features temporarily disabled" });
    }
    if (shouldThrottle("POST")) {
      finishTrace(trace, "throttled");
      return res.status(429).json({ error: "System under load, please retry in a moment" });
    }

    const srl = smartRateLimit(user_id, "post", { content: content?.slice(0, 100) });
    if (srl.limited) {
      finishTrace(trace, "rate_limited");
      log(trace, SPANS.RATE_LIMIT_CHECK, LOG_TYPES.RATE_LIMIT, "429", { reason: srl.reason, userId: user_id });
      return res.status(429).json({ error: "Rate limited: " + srl.reason });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("verification_level")
      .eq("id", user_id)
      .maybeSingle();

    if (!profile || !profile.verification_level) {
      finishTrace(trace, "auth_failed");
      return res.status(403).json({ error: "Device verification required to create posts" });
    }

    const rl = await rateLimitPersistent("create_post:" + user_id, { windowMs: 3600000, max: 15 });
    if (rl.limited) {
      finishTrace(trace, "rate_limited");
      return res.status(429).json({ error: "Max 15 posts per hour" });
    }

    if (shouldQueueSocial()) {
      const cleanContent = sanitizeContent(content || "");
      const qResult = await enqueue(OP_TYPES.POST, { user_id, content: cleanContent, image_url: image_url || null }, user_id);
      if (qResult.queued) {
        trackPost();
        const elapsed = Date.now() - t0;
        trackRequest(elapsed);
        finishTrace(trace, "queued");
        log(trace, SPANS.QUEUE_ENQUEUE, LOG_TYPES.SOCIAL, "202", { queueId: qResult.id });
        return res.status(202).json({ success: true, queued: true, message: "Post queued for processing" });
      }
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "content required" });
    }
    if (content.length > 10000) {
      return res.status(400).json({ error: "content too long" });
    }

    const cleanContent = sanitizeContent(content);
    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase.from("posts").insert({
        user_id,
        content: cleanContent,
        image_url: image_url || null,
        timestamp: now,
        created_at: now,
        deleted_flag: false,
        visibility_score: 0,
        likes: 0,
        comments: 0,
        reposts: 0,
        tips_total: 0,
        boost_score: 0,
        views: 0,
        likes_count: 0,
        replies_count: 0,
        is_ad: false,
        monetized: false,
        is_boosted: false,
      }).select("id").maybeSingle();

      if (error) {
        console.error(JSON.stringify({ event: "error", type: "create_post_db", reqId, endpoint: "/api/createPost", userId: user_id, error: error.message, latency_ms: Date.now() - t0 }));
        finishTrace(trace, "error");
        log(trace, SPANS.WRITE_OPERATION, LOG_TYPES.ERROR, "500", { error: error.message });
        return res.status(500).json({ error: error.message });
      }

      const elapsed = Date.now() - t0;
      trackRequest(elapsed);
      trackPost();
      finishTrace(trace, "ok");
      log(trace, SPANS.RESPONSE, LOG_TYPES.SOCIAL, "201", { postId: data?.id, elapsed });
      console.log(JSON.stringify({ event: "create_post_ok", reqId, traceId: trace.traceId, userId: user_id, postId: data?.id, latency_ms: elapsed }));
      supabase.from("admin_logs").insert({ category: "activity", event: "create_post", severity: "info", user_id, endpoint: "/api/createPost", latency_ms: elapsed, details: { postId: data?.id, content_length: cleanContent?.length, reqId, traceId: trace.traceId } }).catch(() => {});
      return res.status(201).json({ success: true, postId: data?.id });
    } catch (err) {
      const elapsed = Date.now() - t0;
      trackRequest(elapsed, true);
      finishTrace(trace, "error");
      log(trace, SPANS.WRITE_OPERATION, LOG_TYPES.ERROR, "500", { error: err.message });
      console.error(JSON.stringify({ event: "error", type: "create_post_exception", reqId, endpoint: "/api/createPost", userId: user_id, error: err.message, latency_ms: elapsed }));
      supabase.from("admin_logs").insert({ category: "error", event: "create_post_error", severity: "error", user_id, endpoint: "/api/createPost", latency_ms: elapsed, details: { error: err.message, reqId, traceId: trace.traceId } }).catch(() => {});
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
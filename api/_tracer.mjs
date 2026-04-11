import { createClient } from "@supabase/supabase-js";
import { getLogSampleRate } from "./_infra.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

const SPANS = {
  REQUEST_START: "REQUEST_START",
  AUTH_CHECK: "AUTH_CHECK",
  RATE_LIMIT_CHECK: "RATE_LIMIT_CHECK",
  DB_QUERY: "DB_QUERY",
  CURVE_CALC: "CURVE_CALC",
  WRITE_OPERATION: "WRITE_OPERATION",
  QUEUE_ENQUEUE: "QUEUE_ENQUEUE",
  EXTERNAL_API: "EXTERNAL_API",
  CIRCUIT_BREAKER: "CIRCUIT_BREAKER",
  RESPONSE: "RESPONSE",
};

const LOG_TYPES = {
  TRADE: "TRADE",
  SOCIAL: "SOCIAL",
  ERROR: "ERROR",
  SYSTEM: "SYSTEM",
  RATE_LIMIT: "RATE_LIMIT",
  INFRA: "INFRA",
};

const LOG_TIERS = { HOT: "HOT", WARM: "WARM", COLD: "COLD" };

function generateTraceId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `t_${ts}_${rand}`;
}

export function createTrace(endpoint, userId = null) {
  return {
    traceId: generateTraceId(),
    endpoint,
    userId,
    startTime: Date.now(),
    spans: [],
    meta: {},
  };
}

export function startSpan(trace, spanName) {
  const span = {
    name: spanName,
    startTime: Date.now(),
    endTime: null,
    duration: null,
    meta: {},
    error: null,
  };
  trace.spans.push(span);
  return span;
}

export function endSpan(span, meta = {}) {
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  Object.assign(span.meta, meta);
  return span;
}

export function failSpan(span, error) {
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  span.error = typeof error === "string" ? error : error?.message || "unknown";
  return span;
}

export function finishTrace(trace, status = "ok") {
  trace.endTime = Date.now();
  trace.totalLatency = trace.endTime - trace.startTime;
  trace.status = status;
  return trace;
}

const logBuffer = [];
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL = 10000;
let flushTimer = null;

const logStats = {
  total: 0,
  sampled: 0,
  dropped: 0,
  flushed: 0,
  errors: 0,
};

function shouldSample(type) {
  if (type === LOG_TYPES.ERROR || type === LOG_TYPES.TRADE) return true;

  const rate = getLogSampleRate();
  if (rate >= 1.0) return true;
  return Math.random() < rate;
}

function getLogTier(createdAt) {
  const age = Date.now() - new Date(createdAt).getTime();
  if (age < 24 * 60 * 60 * 1000) return LOG_TIERS.HOT;
  if (age < 7 * 24 * 60 * 60 * 1000) return LOG_TIERS.WARM;
  return LOG_TIERS.COLD;
}

async function flushLogs() {
  if (logBuffer.length === 0) return;
  const batch = logBuffer.splice(0, BUFFER_SIZE);
  try {
    const { error } = await supabase.from("system_logs").insert(batch);
    if (error) {
      if (error.message?.includes("does not exist")) return;
      console.error("[TRACER] flush error:", error.message);
      logStats.errors++;
      if (batch.length <= 10) logBuffer.unshift(...batch);
    } else {
      logStats.flushed += batch.length;
    }
  } catch (err) {
    console.error("[TRACER] flush exception:", err.message);
    logStats.errors++;
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushLogs();
  }, FLUSH_INTERVAL);
}

export function log(trace, span, type, status, meta = {}) {
  logStats.total++;

  if (!shouldSample(type)) {
    logStats.dropped++;
    return null;
  }

  logStats.sampled++;

  const entry = {
    trace_id: trace.traceId,
    span: span,
    type: type,
    latency: trace.totalLatency || (Date.now() - trace.startTime),
    user_id: trace.userId || null,
    token: meta.token || meta.tokenId || null,
    status: status,
    endpoint: trace.endpoint,
    meta: meta,
    created_at: new Date().toISOString(),
  };

  logBuffer.push(entry);
  if (logBuffer.length >= BUFFER_SIZE) {
    flushLogs();
  } else {
    scheduleFlush();
  }

  return entry;
}

export function logImmediate(traceId, span, type, userId, token, status, latency, meta = {}) {
  logStats.total++;

  if (!shouldSample(type)) {
    logStats.dropped++;
    return null;
  }

  logStats.sampled++;

  const entry = {
    trace_id: traceId,
    span,
    type,
    latency,
    user_id: userId,
    token: token || null,
    status,
    endpoint: meta.endpoint || null,
    meta,
    created_at: new Date().toISOString(),
  };
  logBuffer.push(entry);
  if (logBuffer.length >= BUFFER_SIZE) flushLogs();
  else scheduleFlush();
  return entry;
}

export async function queryLogs({ userId, token, traceId, type, tier, limit = 50, offset = 0 } = {}) {
  let query = supabase.from("system_logs").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  if (userId) query = query.eq("user_id", userId);
  if (token) query = query.eq("token", token);
  if (traceId) query = query.eq("trace_id", traceId);
  if (type) query = query.eq("type", type);

  if (tier === LOG_TIERS.HOT) {
    query = query.gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  } else if (tier === LOG_TIERS.WARM) {
    query = query.gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  }

  const { data, error } = await query;
  if (error) return { logs: [], error: error.message };
  return { logs: data || [], error: null };
}

export async function forceFlush() {
  await flushLogs();
}

export function getBufferStats() {
  const sampleRate = getLogSampleRate();
  return {
    buffered: logBuffer.length,
    bufferSize: BUFFER_SIZE,
    flushInterval: FLUSH_INTERVAL,
    sampleRate,
    samplePercent: Math.round(sampleRate * 100) + "%",
    stats: { ...logStats },
    tiers: { ...LOG_TIERS },
  };
}

export { SPANS, LOG_TYPES, LOG_TIERS };

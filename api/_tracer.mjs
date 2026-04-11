import { createClient } from "@supabase/supabase-js";

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

function generateTraceId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `t_${ts}_${rand}`;
}

export function createTrace(endpoint, userId = null) {
  const traceId = generateTraceId();
  const trace = {
    traceId,
    endpoint,
    userId,
    startTime: Date.now(),
    spans: [],
    meta: {},
  };
  return trace;
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

async function flushLogs() {
  if (logBuffer.length === 0) return;
  const batch = logBuffer.splice(0, BUFFER_SIZE);
  try {
    const { error } = await supabase.from("system_logs").insert(batch);
    if (error) {
      if (error.message?.includes("does not exist")) return;
      console.error("[TRACER] flush error:", error.message);
      if (batch.length <= 10) logBuffer.unshift(...batch);
    }
  } catch (err) {
    console.error("[TRACER] flush exception:", err.message);
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

export async function queryLogs({ userId, token, traceId, type, limit = 50, offset = 0 } = {}) {
  let query = supabase.from("system_logs").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  if (userId) query = query.eq("user_id", userId);
  if (token) query = query.eq("token", token);
  if (traceId) query = query.eq("trace_id", traceId);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return { logs: [], error: error.message };
  return { logs: data || [], error: null };
}

export async function forceFlush() {
  await flushLogs();
}

export function getBufferStats() {
  return {
    buffered: logBuffer.length,
    bufferSize: BUFFER_SIZE,
    flushInterval: FLUSH_INTERVAL,
  };
}

export { SPANS, LOG_TYPES };

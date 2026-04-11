import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

const OP_TYPES = { BUY: "BUY", SELL: "SELL", LIKE: "LIKE", POST: "POST", DELETE: "DELETE" };
const STATUSES = { PENDING: "PENDING", PROCESSING: "PROCESSING", DONE: "DONE", FAILED: "FAILED" };
const PRIORITIES = { high: 1, medium: 2, low: 3 };

const inMemoryQueue = [];
const MAX_MEMORY_QUEUE = 5000;
const BATCH_SIZE = 25;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

const workerState = {
  running: false,
  processed: 0,
  failed: 0,
  lastRun: null,
  intervalMs: 2000,
  timer: null,
};

function priorityFor(type) {
  if (type === OP_TYPES.BUY || type === OP_TYPES.SELL) return "high";
  if (type === OP_TYPES.POST) return "medium";
  return "low";
}

export async function enqueue(type, payload, userId, priority = null) {
  const op = {
    type,
    payload: typeof payload === "string" ? payload : JSON.stringify(payload),
    user_id: userId,
    status: STATUSES.PENDING,
    priority: priority || priorityFor(type),
    retries: 0,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("operation_queue").insert(op).select("id").maybeSingle();
    if (error) {
      if (error.message?.includes("does not exist")) {
        return enqueueInMemory(op);
      }
      throw error;
    }
    return { queued: true, id: data?.id, storage: "db" };
  } catch (err) {
    return enqueueInMemory(op);
  }
}

function enqueueInMemory(op) {
  if (inMemoryQueue.length >= MAX_MEMORY_QUEUE) {
    return { queued: false, reason: "queue_full" };
  }
  op.id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  inMemoryQueue.push(op);
  inMemoryQueue.sort((a, b) => PRIORITIES[a.priority] - PRIORITIES[b.priority]);
  return { queued: true, id: op.id, storage: "memory" };
}

async function fetchBatch() {
  try {
    const { data, error } = await supabase
      .from("operation_queue")
      .select("*")
      .eq("status", STATUSES.PENDING)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      if (error.message?.includes("does not exist")) {
        return fetchMemoryBatch();
      }
      throw error;
    }
    return data || [];
  } catch {
    return fetchMemoryBatch();
  }
}

function fetchMemoryBatch() {
  const batch = inMemoryQueue.splice(0, BATCH_SIZE);
  return batch;
}

async function markProcessing(ids) {
  if (ids.length === 0) return;
  const dbIds = ids.filter(id => !String(id).startsWith("mem_"));
  if (dbIds.length > 0) {
    await supabase.from("operation_queue").update({ status: STATUSES.PROCESSING }).in("id", dbIds).catch(() => {});
  }
}

async function markDone(id) {
  if (String(id).startsWith("mem_")) return;
  await supabase.from("operation_queue")
    .update({ status: STATUSES.DONE, completed_at: new Date().toISOString() })
    .eq("id", id).catch(() => {});
}

async function markFailed(id, error, retries) {
  if (String(id).startsWith("mem_")) return;
  const newStatus = retries >= MAX_RETRIES ? STATUSES.FAILED : STATUSES.PENDING;
  await supabase.from("operation_queue")
    .update({ status: newStatus, error_message: error, retries, next_retry: new Date(Date.now() + BASE_BACKOFF_MS * Math.pow(2, retries)).toISOString() })
    .eq("id", id).catch(() => {});
}

const handlers = new Map();

export function registerHandler(type, fn) {
  handlers.set(type, fn);
}

async function processOp(op) {
  const handler = handlers.get(op.type);
  if (!handler) {
    console.warn(`[QUEUE] No handler for type: ${op.type}`);
    await markFailed(op.id, "no_handler", MAX_RETRIES);
    return false;
  }

  try {
    const payload = typeof op.payload === "string" ? JSON.parse(op.payload) : op.payload;
    await handler(payload, op);
    await markDone(op.id);
    workerState.processed++;
    return true;
  } catch (err) {
    const retries = (op.retries || 0) + 1;
    await markFailed(op.id, err.message, retries);
    if (retries >= MAX_RETRIES) workerState.failed++;
    return false;
  }
}

async function processBatch() {
  const batch = await fetchBatch();
  if (batch.length === 0) return 0;

  await markProcessing(batch.map(op => op.id));

  let processed = 0;
  for (const op of batch) {
    const ok = await processOp(op);
    if (ok) processed++;
  }
  return processed;
}

export function startWorker(intervalMs = 2000) {
  if (workerState.running) return;
  workerState.running = true;
  workerState.intervalMs = intervalMs;

  async function tick() {
    try {
      workerState.lastRun = new Date().toISOString();
      await processBatch();
    } catch (err) {
      console.error("[QUEUE_WORKER] tick error:", err.message);
    }
    if (workerState.running) {
      workerState.timer = setTimeout(tick, workerState.intervalMs);
    }
  }

  tick();
}

export function stopWorker() {
  workerState.running = false;
  if (workerState.timer) {
    clearTimeout(workerState.timer);
    workerState.timer = null;
  }
}

export async function getQueueStats() {
  let dbStats = { pending: 0, processing: 0, done: 0, failed: 0 };
  try {
    const counts = await Promise.all([
      supabase.from("operation_queue").select("id", { count: "exact", head: true }).eq("status", STATUSES.PENDING),
      supabase.from("operation_queue").select("id", { count: "exact", head: true }).eq("status", STATUSES.PROCESSING),
      supabase.from("operation_queue").select("id", { count: "exact", head: true }).eq("status", STATUSES.DONE),
      supabase.from("operation_queue").select("id", { count: "exact", head: true }).eq("status", STATUSES.FAILED),
    ]);
    dbStats = {
      pending: counts[0].count || 0,
      processing: counts[1].count || 0,
      done: counts[2].count || 0,
      failed: counts[3].count || 0,
    };
  } catch {}

  return {
    db: dbStats,
    memory: {
      pending: inMemoryQueue.length,
      maxSize: MAX_MEMORY_QUEUE,
    },
    worker: {
      running: workerState.running,
      processed: workerState.processed,
      failed: workerState.failed,
      lastRun: workerState.lastRun,
      batchSize: BATCH_SIZE,
      intervalMs: workerState.intervalMs,
    },
  };
}

export async function drainQueue() {
  let total = 0;
  let batch;
  do {
    batch = await processBatch();
    total += batch;
  } while (batch > 0);
  return total;
}

export { OP_TYPES, STATUSES, PRIORITIES };

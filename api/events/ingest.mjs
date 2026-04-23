import { Redis } from "@upstash/redis"

// =========================
// CONFIG
// =========================

const redis = Redis.fromEnv()

const MAX_QUEUE_PACKS = 5000
const MAX_PACK_SIZE = 50
const DEDUPE_TTL = 60
const OVERFLOW_TTL = 120

// =========================
// WORLD APP ID NORMALIZATION
// =========================

// En World App puedes recibir:
// - user_id (backend)
// - null (device anon)
// - world_id (si luego lo integras)
//
// Nunca asumimos identidad fuerte aquí.

function normalizeUserId(userId) {
  if (!userId || typeof userId !== "string") return "anon"
  return userId
}

// =========================
// SHARDING (ESTABLE)
// =========================

function shardOf(userId) {
  const id = normalizeUserId(userId)

  // hash ligero para evitar skew en "anon"
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }

  const shard = Math.abs(hash % 256)
  return shard.toString(16).padStart(2, "0")
}

// =========================
// ROUTING INTELIGENTE (SIN SESGO ORB)
// =========================

function getQueueType(event, isTrusted, suspectedBot) {
  // 🔥 CRITICAL solo si hay señal REAL de anomalía
  if (suspectedBot) return "critical"

  // Engagement explícito (alto valor semántico)
  if (
    event === "like" ||
    event === "share" ||
    event === "comment_intent" ||
    event === "profile_click"
  ) {
    return "engagement"
  }

  // Raw stream (scroll, impression, etc.)
  return "raw"
}

// =========================
// VALIDACIÓN LIGERA (NO BLOQUEANTE)
// =========================

function isValidEvent(ev) {
  if (!ev) return false

  if (typeof ev.event !== "string") return false
  if (typeof ev.ts !== "number") return false
  if (!ev.client_hash) return false

  // Protección básica contra basura extrema
  if (ev.ts < Date.now() - 1000 * 60 * 15) return false

  return true
}

// =========================
// RESPONSE HELPER
// =========================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

// =========================
// HANDLER
// =========================

export async function POST(req) {
  try {
    const body = await req.json()
    const events = body?.events
    const suspected_bot = body?.suspected_bot || false

    if (!events || !Array.isArray(events) || events.length === 0) {
      return json({ ok: true, queued: 0 })
    }

    // ==========================================
    // 1. VALIDACIÓN + NORMALIZACIÓN
    // ==========================================

    const sanitized = []

    for (const ev of events) {
      if (!isValidEvent(ev)) continue

      sanitized.push({
        ...ev,
        user_id: normalizeUserId(ev.user_id),
        batch_suspected_bot: suspected_bot || false
      })
    }

    if (sanitized.length === 0) {
      return json({ ok: true, queued: 0 })
    }

    // ==========================================
    // 2. DEDUPE PIPELINED (ANTI-REPLAY)
    // ==========================================

    const dedupePipe = redis.pipeline()

    for (const ev of sanitized) {
      dedupePipe.set(`dedupe:${ev.client_hash}`, 1, {
        nx: true,
        ex: DEDUPE_TTL
      })
    }

    const dedupeResults = await dedupePipe.exec()

    const validEvents = []

    for (let i = 0; i < sanitized.length; i++) {
      if (dedupeResults[i] === "OK") {
        validEvents.push(sanitized[i])
      }
    }

    if (validEvents.length === 0) {
      return json({
        ok: true,
        queued: 0,
        deduped: sanitized.length
      })
    }

    // ==========================================
    // 3. AGRUPACIÓN (SHARD + TYPE)
    // ==========================================

    const packs = {}

    for (const ev of validEvents) {
      const shard = shardOf(ev.user_id)

      const type = getQueueType(
        ev.event,
        ev.is_trusted,
        ev.batch_suspected_bot
      )

      const queueKey = `totem_queue:${type}:${shard}`

      if (!packs[queueKey]) packs[queueKey] = []

      packs[queueKey].push(ev)
    }

    // ==========================================
    // 4. PIPELINE PUSH + BACKPRESSURE + OVERFLOW
    // ==========================================

    const pushPipe = redis.pipeline()

    for (const [queueKey, arr] of Object.entries(packs)) {
      for (let i = 0; i < arr.length; i += MAX_PACK_SIZE) {
        const chunk = arr.slice(i, i + MAX_PACK_SIZE)

        // push pack
        pushPipe.rpush(queueKey, JSON.stringify(chunk))

        // backpressure
        pushPipe.ltrim(queueKey, -MAX_QUEUE_PACKS, -1)

        // overflow signal (TCE usa esto)
        const overflowKey = `queue_overflow:${queueKey}`
        pushPipe.incr(overflowKey)
        pushPipe.expire(overflowKey, OVERFLOW_TTL)
      }
    }

    await pushPipe.exec()

    // ==========================================
    // 5. RESPUESTA
    // ==========================================

    return json({
      ok: true,
      received: events.length,
      valid: validEvents.length,
      queued: validEvents.length,
      deduped: sanitized.length - validEvents.length
    })
  } catch (err) {
    console.error("[INGEST_ERROR]", err)

    // antifrágil: jamás provocar retry storm
    return json({ ok: false }, 200)
  }
}

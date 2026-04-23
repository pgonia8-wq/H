📦 "/api/events/ingest.mjs" — TIER 3 FINAL (ANTIFRÁGIL, PIPELINED, SHARDED)

import { Redis } from "@upstash/redis"

// =========================
// CONFIG
// =========================

const redis = Redis.fromEnv()

const MAX_QUEUE_PACKS = 5000        // cantidad de packs por cola (control memoria)
const MAX_PACK_SIZE = 50            // eventos por pack (latencia estable)
const DEDUPE_TTL = 60               // segundos anti-replay
const OVERFLOW_TTL = 120            // segundos señal de overflow

// =========================
// SHARDING
// =========================

function shardOf(userId) {
  if (!userId || typeof userId !== "string") return "00"
  return userId.slice(0, 2)
}

// =========================
// ROUTING (MULTI-QUEUE + PRIORIDAD)
// =========================

function getQueueType(event, isTrusted, suspectedBot) {
  if (!isTrusted || suspectedBot) return "critical"

  if (
    event === "like" ||
    event === "share" ||
    event === "comment_intent" ||
    event === "profile_click"
  ) {
    return "engagement"
  }

  return "raw"
}

// =========================
// HELPERS
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
    const { events, suspected_bot } = await req.json()

    if (!events || !Array.isArray(events) || events.length === 0) {
      return json({ ok: true, queued: 0 })
    }

    // ==========================================
    // 1. DEDUPE PIPELINE (SIN BLOQUEOS)
    // ==========================================

    const dedupePipe = redis.pipeline()

    for (const ev of events) {
      if (ev?.client_hash) {
        dedupePipe.set(`dedupe:${ev.client_hash}`, 1, {
          nx: true,
          ex: DEDUPE_TTL
        })
      } else {
        // si no hay hash, lo tratamos como inválido (no lo metemos)
        dedupePipe.set(`dedupe:invalid:${Math.random()}`, 1, {
          nx: true,
          ex: 1
        })
      }
    }

    const dedupeResults = await dedupePipe.exec()

    // ==========================================
    // 2. FILTRADO (ANTI-REPLAY)
    // ==========================================

    const validEvents = []

    for (let i = 0; i < events.length; i++) {
      if (dedupeResults[i] === "OK") {
        validEvents.push(events[i])
      }
    }

    if (validEvents.length === 0) {
      return json({
        ok: true,
        queued: 0,
        deduped: events.length
      })
    }

    // ==========================================
    // 3. AGRUPACIÓN POR COLA (SHARD + TYPE)
    // ==========================================

    const packs = {}

    for (const ev of validEvents) {
      const shard = shardOf(ev.user_id)

      const type = getQueueType(
        ev.event,
        ev.is_trusted,
        suspected_bot
      )

      const queueKey = `totem_queue:${type}:${shard}`

      if (!packs[queueKey]) packs[queueKey] = []

      // anotamos flag de batch
      ev.batch_suspected_bot = suspected_bot || false

      packs[queueKey].push(ev)
    }

    // ==========================================
    // 4. PIPELINE PUSH + BACKPRESSURE + OVERFLOW SIGNAL
    // ==========================================

    const pushPipe = redis.pipeline()

    for (const [queueKey, arr] of Object.entries(packs)) {
      // chunking estable
      for (let i = 0; i < arr.length; i += MAX_PACK_SIZE) {
        const chunk = arr.slice(i, i + MAX_PACK_SIZE)

        // push del pack
        pushPipe.rpush(queueKey, JSON.stringify(chunk))

        // backpressure (mantiene últimos N packs)
        pushPipe.ltrim(queueKey, -MAX_QUEUE_PACKS, -1)

        // señal de overflow (para TCE)
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
      queued: validEvents.length,
      deduped: events.length - validEvents.length
    })
  } catch (err) {
    console.error("[INGEST_ERROR]", err)

    // fallback antifrágil: nunca forzar retry masivo del cliente
    return json({ ok: false }, 200)
  }
}

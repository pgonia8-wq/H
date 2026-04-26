import { createClient } from "@supabase/supabase-js"
import { Redis } from "@upstash/redis"

// =========================
// CONFIGURACIÓN
// =========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const redis = Redis.fromEnv()

const BUCKET_SIZE_MS = 5000
const OVERFLOW_THRESHOLD = 50
const MAX_EVENTS_PER_RUN = 20000
const LOCK_KEY = "totem_worker_lock"

const BUDGET = {
  critical: 200,   // Prioridad 1: Anomalías
  engagement: 200, // Prioridad 2: Señales económicas
  raw: 50          // Prioridad 3: Ruido/Scroll
}

const SHARDS = ["00", "01", "02", "03", "0a", "0b"]

// =========================
// UTILS
// =========================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

function avgArr(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

// =========================
// HANDLER (CRON)
// =========================
export async function GET() {
  try {
    // ---------------------------------------------------------
    // 0. DISTRIBUTED LOCK (Evita colisiones a 3M users)
    // ---------------------------------------------------------
    const acquired = await redis.set(LOCK_KEY, "true", { nx: true, ex: 55 })
    if (!acquired) {
      return json({ ok: true, message: "Another worker is active" })
    }

    let events = []
    let systemUnderAttack = false

    // ---------------------------------------------------------
    // 1. LECTURA EN BLOQUE (Optimizado para latencia)
    // ---------------------------------------------------------
    const pipe = redis.pipeline()

    for (const shard of SHARDS) {
      for (const type of ["critical", "engagement", "raw"]) {
        const key = `totem_queue:${type}:${shard}`
        const overflowKey = `queue_overflow:${key}`

        pipe.get(overflowKey)
        pipe.lrange(key, 0, BUDGET[type] - 1)
        pipe.ltrim(key, BUDGET[type], -1)
      }
    }

    const res = await pipe.exec()

    // ---------------------------------------------------------
    // 2. PARSE Y CONTROL DE MEMORIA
    // ---------------------------------------------------------
    let cursor = 0
    for (const shard of SHARDS) {
      for (const type of ["critical", "engagement", "raw"]) {
        const overflow = Number(res[cursor]) || 0
        cursor++ // Resultado del GET overflowKey

        if (overflow > OVERFLOW_THRESHOLD) systemUnderAttack = true

        const packs = res[cursor]
        cursor++ // Resultado del LRANGE

        cursor++ // Skip el resultado del LTRIM

        if (!packs) continue

        for (const p of packs) {
          try {
            const parsed = JSON.parse(p)
            events.push(...parsed)
          } catch {}
          if (events.length >= MAX_EVENTS_PER_RUN) break
        }
        if (events.length >= MAX_EVENTS_PER_RUN) break
      }
      if (events.length >= MAX_EVENTS_PER_RUN) break
    }

    if (events.length === 0) {
      await redis.del(LOCK_KEY)
      return json({ ok: true, empty: true })
    }

    // ---------------------------------------------------------
    // 3. AGRUPACIÓN POR SESIÓN Y BUCKET
    // ---------------------------------------------------------
    const sessions = new Map()
    const buckets = new Map()
    const sessionIds = new Set()

    for (const ev of events) {
      const sKey = `${ev.user_id}:${ev.session_id}`
      const bKey = `${Math.floor(ev.ts / BUCKET_SIZE_MS)}:${ev.post_id}`

      if (!sessions.has(sKey)) sessions.set(sKey, [])
      sessions.get(sKey).push(ev)

      if (!buckets.has(bKey)) buckets.set(bKey, [])
      buckets.get(bKey).push(ev)

      sessionIds.add(ev.session_id)
    }

    // ---------------------------------------------------------
    // 4. BATCH FETCH (Existentes en Supabase)
    // ---------------------------------------------------------
    const existingMap = new Map()
    const sessionIdsArray = Array.from(sessionIds)
    
    for (const c of chunk(sessionIdsArray, 500)) {
      const { data: existing } = await supabase
        .from("feed_sessions")
        .select("*")
        .in("session_id", c)

      if (existing) {
        for (const s of existing) {
          existingMap.set(`${s.user_id}:${s.session_id}`, s)
        }
      }
    }

    const sessionUpdates = []
    const bucketUpdates = []

    // ---------------------------------------------------------
    // 5. ENGINE DE SESIÓN (Cálculo de Humanidad)
    // ---------------------------------------------------------
    for (const [key, evs] of sessions.entries()) {
      const { user_id, session_id } = evs[0]

      let s = existingMap.get(key) || {
        user_id, session_id, event_count: 0, interactions: 0,
        avg_velocity: 0, avg_jitter: 0, velocity_count: 0, jitter_count: 0,
        scroll_depth: 0, anomaly_score: 0
      }

      let v = [], j = []

      for (const ev of evs) {
        const m = ev.metrics || {}
        s.event_count++

        if (m.scroll_depth !== undefined) s.scroll_depth = Math.max(s.scroll_depth, m.scroll_depth)
        
        if (m.velocity !== undefined) {
          s.velocity_count++
          s.avg_velocity = (s.avg_velocity * (s.velocity_count - 1) + m.velocity) / s.velocity_count
          v.push(m.velocity)
        }

        if (m.jitter !== undefined) {
          s.jitter_count++
          s.avg_jitter = (s.avg_jitter * (s.jitter_count - 1) + m.jitter) / s.jitter_count
          j.push(m.jitter)
        }

        if (["like", "share", "comment_intent"].includes(ev.event)) s.interactions++
        if (!ev.is_trusted || ev.batch_suspected_bot) s.anomaly_score++
      }

      if (systemUnderAttack) s.anomaly_score += 2

      const fingerprint = {
        vel: Math.round(avgArr(v) * 10),
        jit: Math.round(avgArr(j) * 10),
        depth: Math.round(s.scroll_depth * 10)
      }

      s.fingerprint = fingerprint
      s.fingerprint_entropy = Math.abs(fingerprint.vel - fingerprint.jit) + fingerprint.depth
      sessionUpdates.push(s)
    }

    // ---------------------------------------------------------
    // 6. TCE (Coordinación Temporal)
    // ---------------------------------------------------------
    for (const [key, evs] of buckets.entries()) {
      const [bucket_id, post_id] = key.split(":")
      const users = new Set()
      const jit = []
      let trusted = 0

      for (const ev of evs) {
        users.add(ev.user_id)
        if (ev.metrics?.jitter !== undefined) jit.push(ev.metrics.jitter)
        if (ev.is_trusted) trusted++
      }

      const avgJit = avgArr(jit)
      let coord = (users.size > 3 && avgJit < 0.1) ? Math.min(1, (0.1 - avgJit) * 10) : 0
      if (systemUnderAttack && users.size > 10) coord = 1

      bucketUpdates.push({
        bucket_id, post_id,
        user_count: users.size,
        avg_jitter: avgJit,
        trust_ratio: evs.length ? trusted / evs.length : 0,
        coordination_score: coord,
        created_at: new Date().toISOString()
      })
    }

    // ---------------------------------------------------------
    // 7. PERSISTENCIA PARALELA (Upsert)
    // ---------------------------------------------------------
    const promises = []
    for (const c of chunk(sessionUpdates, 1000)) {
      promises.push(supabase.from("feed_sessions").upsert(c, { onConflict: "user_id,session_id" }))
    }
    for (const c of chunk(bucketUpdates, 1000)) {
      promises.push(supabase.from("feed_buckets").upsert(c, { onConflict: "bucket_id,post_id" }))
    }
    await Promise.all(promises)

    // ---------------------------------------------------------
    // 8. CLEANUP (Libera Lock + Overflow)
    // ---------------------------------------------------------
    if (systemUnderAttack) {
      const clean = redis.pipeline()
      for (const shard of SHARDS) {
        for (const type of ["critical", "engagement", "raw"]) {
          clean.del(`queue_overflow:totem_queue:${type}:${shard}`)
        }
      }
      await clean.exec()
    }

    await redis.del(LOCK_KEY)

    return json({
      ok: true,
      processed: events.length,
      sessions: sessionUpdates.length,
      attack: systemUnderAttack
    })

  } catch (err) {
    await redis.del(LOCK_KEY)
    console.error("[WORKER_ERROR]", err)
    return json({ error: true }, 500)
  }
}

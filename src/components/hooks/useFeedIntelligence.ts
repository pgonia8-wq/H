// 📦 "src/components/hooks/useFeedIntelligence.ts" — FINAL (FASE 1 COMPLETA)

import { useEffect, useRef, useCallback } from "react"

// =========================
// TYPES
// =========================

export type FeedEvent =
  | "impression"
  | "view"
  | "scroll"
  | "like"
  | "share"
  | "comment_intent"
  | "profile_click"
  | "media_expand"
  | "exit"

export type IntelligencePayload = {
  user_id: string
  post_id: string
  event: FeedEvent
  ts: number

  // comportamiento físico
  dwell_time?: number
  scroll_depth?: number
  velocity?: number
  jitter?: number

  // contexto
  session_id: string
  feed_position: number
  is_trusted: boolean

  // integridad
  client_hash: string
}

// =========================
// CONFIG
// =========================

const ENDPOINT = "/api/events/batch"
const BATCH_SIZE = 12
const FLUSH_INTERVAL = 4000
const MAX_HUMAN_VELOCITY = 4
const SCROLL_THROTTLE_MS = 100

// =========================
// UTILS
// =========================

function now() {
  return Date.now()
}

function safeUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now()
}

function hashPayload(payload: object) {
  try {
    return btoa(JSON.stringify(payload)).slice(0, 16)
  } catch {
    return "hash_error"
  }
}

function calculateJitter(vels: number[]) {
  if (vels.length < 2) return 0

  const mean = vels.reduce((a, b) => a + b, 0) / vels.length
  if (mean === 0) return 0

  const variance =
    vels.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) /
    vels.length

  const std = Math.sqrt(variance)
  return std / mean
}

// =========================
// HOOK
// =========================

export function useFeedIntelligence(
  userId: string,
  postId: string,
  feedPosition: number
) {
  const sessionId = useRef<string>(safeUUID())

  const visibleStart = useRef<number | null>(null)
  const dwellTime = useRef(0)
  const maxScroll = useRef(0)

  const eventQueue = useRef<IntelligencePayload[]>([])
  const velocities = useRef<number[]>([])
  const suspectedBot = useRef(false)

  const lastScrollTs = useRef(now())
  const lastScrollY = useRef(0)
  const lastThrottleTs = useRef(0)

  const lastInteraction = useRef(now())

  // =========================
  // PRESENCE (REAL)
  // =========================

  useEffect(() => {
    const update = () => {
      lastInteraction.current = now()
    }

    window.addEventListener("mousemove", update, { passive: true })
    window.addEventListener("touchstart", update, { passive: true })
    window.addEventListener("keydown", update, { passive: true })

    return () => {
      window.removeEventListener("mousemove", update)
      window.removeEventListener("touchstart", update)
      window.removeEventListener("keydown", update)
    }
  }, [])

  const isUserActive = useCallback(() => {
    return now() - lastInteraction.current < 8000
  }, [])

  // =========================
  // FLUSH
  // =========================

  const flush = useCallback(async (isExit = false) => {
    if (eventQueue.current.length === 0) return

    const batch = [...eventQueue.current]

    try {
      const MAX_EXIT_BATCH = 20

      const batches = isExit
        ? Array.from(
            { length: Math.ceil(batch.length / MAX_EXIT_BATCH) },
            (_, i) => batch.slice(i * MAX_EXIT_BATCH, (i + 1) * MAX_EXIT_BATCH)
          )
        : [batch]

      for (const b of batches) {
        await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            events: b,
            suspected_bot: suspectedBot.current
          }),
          keepalive: isExit
        })
      }

      // limpiar solo si éxito
      eventQueue.current = []
      suspectedBot.current = false
      velocities.current = []
    } catch (err) {
      console.error("[FeedIntelligence] flush error", err)
      // no limpiamos → retry natural en siguiente flush
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => flush(false), FLUSH_INTERVAL)
    return () => clearInterval(interval)
  }, [flush])

  // =========================
  // EMIT
  // =========================

  const emit = useCallback(
    (event: FeedEvent, extra: Partial<IntelligencePayload> = {}) => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      )
        return

      if (!isUserActive() && event !== "exit") return

      const isWebDriver =
        typeof navigator !== "undefined" ? navigator.webdriver : false

      const jitterScore =
        velocities.current.length > 5
          ? calculateJitter(velocities.current)
          : 0

      const trusted =
        !isWebDriver && !suspectedBot.current && jitterScore > 0.05

      const base = {
        user_id: userId,
        post_id: postId,
        event,
        ts: now(),
        session_id: sessionId.current,
        feed_position: feedPosition,
        is_trusted: trusted,
        ...extra
      }

      const payload: IntelligencePayload = {
        ...base,
        client_hash: hashPayload(base)
      }

      eventQueue.current.push(payload)

      if (eventQueue.current.length >= BATCH_SIZE) {
        flush(false)
      }
    },
    [userId, postId, feedPosition, isUserActive, flush]
  )

  // =========================
  // VISIBILITY
  // =========================

  useEffect(() => {
    const el = document.getElementById(`post-${postId}`)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const t = now()

        if (entry.isIntersecting) {
          visibleStart.current = t
          emit("impression")
        } else {
          if (visibleStart.current) {
            const delta = t - visibleStart.current
            dwellTime.current += delta

            if (delta > 500) {
              emit("view", {
                dwell_time: dwellTime.current / 1000
              })
            }
          }
          visibleStart.current = null
        }
      },
      { threshold: [0.25, 0.6, 0.9] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [postId, emit])

  // =========================
  // SCROLL
  // =========================

  const trackScroll = useCallback(
    (currentY: number, maxHeight: number) => {
      const t = now()

      if (t - lastThrottleTs.current < SCROLL_THROTTLE_MS) return
      lastThrottleTs.current = t

      const deltaY = Math.abs(currentY - lastScrollY.current)
      const deltaT = t - lastScrollTs.current

      const velocity = deltaT > 0 ? deltaY / deltaT : 0

      if (velocity > MAX_HUMAN_VELOCITY) {
        suspectedBot.current = true
      }

      velocities.current.push(velocity)
      if (velocities.current.length > 25) velocities.current.shift()

      const jitter = calculateJitter(velocities.current)

      const depth = Math.max(
        0,
        Math.min(1, maxHeight > 0 ? currentY / maxHeight : 0)
      )

      maxScroll.current = Math.max(maxScroll.current, depth)

      emit("scroll", {
        scroll_depth: depth,
        velocity,
        jitter
      })

      lastScrollY.current = currentY
      lastScrollTs.current = t
    },
    [emit]
  )

  // =========================
  // EVENTOS RICOS
  // =========================

  const trackLike = useCallback(() => emit("like"), [emit])
  const trackShare = useCallback(() => emit("share"), [emit])
  const trackProfileClick = useCallback(() => emit("profile_click"), [emit])
  const trackMediaExpand = useCallback(() => emit("media_expand"), [emit])
  const trackCommentIntent = useCallback(
    () => emit("comment_intent"),
    [emit]
  )

  // =========================
  // EXIT
  // =========================

  useEffect(() => {
    return () => {
      if (visibleStart.current) {
        dwellTime.current += now() - visibleStart.current
      }

      emit("exit", {
        dwell_time: dwellTime.current / 1000,
        scroll_depth: maxScroll.current
      })

      flush(true)
    }
  }, [emit, flush])

  return {
    trackScroll,
    trackLike,
    trackShare,
    trackProfileClick,
    trackMediaExpand,
    trackCommentIntent
  }
}

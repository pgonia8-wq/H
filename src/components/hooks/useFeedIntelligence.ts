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

  // Comportamiento físico
  dwell_time?: number
  scroll_depth?: number
  velocity?: number
  jitter?: number

  // Contexto y seguridad
  session_id: string
  feed_position: number
  is_trusted: boolean
  client_hash: string
}

// =========================
// CONFIGURACIÓN GLOBAL
// =========================

const ENDPOINT = "/api/events/batch"
const BATCH_SIZE = 12
const FLUSH_INTERVAL = 4000 // ms
const MAX_HUMAN_VELOCITY = 4 // px/ms
const SCROLL_THROTTLE_MS = 100 // Evita destruir los 60 FPS del dispositivo

// =========================
// UTILS MATEMÁTICOS Y CRIPTOGRÁFICOS
// =========================

function now(): number {
  return Date.now()
}

// Hash ligero para mitigar manipulación básica en cliente
function hashPayload(payload: object): string {
  try {
    return btoa(JSON.stringify(payload)).slice(0, 16)
  } catch {
    return "hash_error"
  }
}

// Coeficiente de Variación (std/mean) para detectar bots mecánicos
function calculateJitter(vels: number[]): number {
  if (vels.length < 2) return 0
  const mean = vels.reduce((a, b) => a + b, 0) / vels.length
  if (mean === 0) return 0
  const variance = vels.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / vels.length
  const std = Math.sqrt(variance)
  return std / mean
}

// =========================
// HOOK PRINCIPAL
// =========================

export function useFeedIntelligence(
  userId: string,
  postId: string,
  feedPosition: number
) {
  // Identidad temporal de la sesión de lectura
  const sessionId = useRef<string>(crypto.randomUUID())

  // Estado del DOM y visibilidad
  const visibleStart = useRef<number | null>(null)
  const dwellTime = useRef<number>(0)
  const maxScroll = useRef<number>(0)

  // Colas y buffers
  const eventQueue = useRef<IntelligencePayload[]>([])
  const velocities = useRef<number[]>([])
  
  // Detección de anomalías
  const suspectedBot = useRef<boolean>(false)
  
  // Control de FPS (Throttle)
  const lastScrollTs = useRef<number>(now())
  const lastScrollY = useRef<number>(0)
  const lastThrottleTs = useRef<number>(0)

  // Heartbeat de presencia real
  const lastInteraction = useRef<number>(now())

  // =========================
  // 1. HEARTBEAT DE PRESENCIA
  // =========================
  
  useEffect(() => {
    const updatePresence = () => { lastInteraction.current = now() }
    
    // Captura cualquier indicio de vida
    window.addEventListener("mousemove", updatePresence, { passive: true })
    window.addEventListener("touchstart", updatePresence, { passive: true })
    window.addEventListener("keydown", updatePresence, { passive: true })
    window.addEventListener("scroll", updatePresence, { passive: true })

    return () => {
      window.removeEventListener("mousemove", updatePresence)
      window.removeEventListener("touchstart", updatePresence)
      window.removeEventListener("keydown", updatePresence)
      window.removeEventListener("scroll", updatePresence)
    }
  }, [])

  const isUserActive = useCallback(() => {
    return now() - lastInteraction.current < 8000 // 8 segundos de tolerancia
  }, [])

  // =========================
  // 2. MOTOR DE BATCHING Y ENVÍO
  // =========================

  const flush = useCallback(async (isExit = false) => {
    if (eventQueue.current.length === 0) return

    const batch = [...eventQueue.current]
    eventQueue.current = [] // Limpiar cola inmediatamente para evitar duplicados

    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          events: batch, 
          suspected_bot: suspectedBot.current 
        }),
        // Crucial: keepalive asegura que el request termine aunque el usuario cierre la app
        keepalive: isExit 
      })
    } catch (err) {
      console.error("[FeedIntelligence] Batch send failed", err)
      // Opcional: Podrías re-encolar los eventos fallidos si no es un exit
    }

    suspectedBot.current = false
    velocities.current = []
  }, [])

  // Auto-flush por intervalo
  useEffect(() => {
    const interval = setInterval(() => flush(false), FLUSH_INTERVAL)
    return () => clearInterval(interval)
  }, [flush])

  // =========================
  // 3. EMISOR DE EVENTOS (SENSOR)
  // =========================

  const emit = useCallback((event: FeedEvent, extra: Partial<IntelligencePayload> = {}) => {
    // Anti-tab farming: Si la pestaña no se ve, no generamos señal
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return
    
    // Si no hay actividad física reciente, ignoramos (bot estático)
    if (!isUserActive() && event !== "exit") return

    // Chequeo básico de automatización
    const isWebDriver = typeof navigator !== "undefined" ? navigator.webdriver : false
    const trusted = !isWebDriver && !suspectedBot.current

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

    // Flush inmediato si llegamos al límite
    if (eventQueue.current.length >= BATCH_SIZE) {
      flush(false)
    }
  }, [userId, postId, feedPosition, isUserActive, flush])

  // =========================
  // 4. SEGUIMIENTO DE VISIBILIDAD (IMPRESSION/VIEW)
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
            const timeSpent = t - visibleStart.current
            dwellTime.current += timeSpent
            
            // Solo emitimos view si realmente lo miró (> 500ms)
            if (timeSpent > 500) {
              emit("view", { dwell_time: dwellTime.current / 1000 })
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
  // 5. SEGUIMIENTO FÍSICO (SCROLL THROTTLED)
  // =========================

  const trackScroll = useCallback((currentY: number, maxHeight: number) => {
    const t = now()
    
    // THROTTLE: Protege los 60 FPS ignorando eventos demasiado seguidos
    if (t - lastThrottleTs.current < SCROLL_THROTTLE_MS) return
    lastThrottleTs.current = t

    const deltaY = Math.abs(currentY - lastScrollY.current)
    const deltaT = t - lastScrollTs.current
    const velocity = deltaT > 0 ? deltaY / deltaT : 0

    // Castigo por velocidad sobrehumana
    if (velocity > MAX_HUMAN_VELOCITY) {
      suspectedBot.current = true
    }

    velocities.current.push(velocity)
    if (velocities.current.length > 15) velocities.current.shift()

    const jitter = calculateJitter(velocities.current)
    const depth = maxHeight > 0 ? currentY / maxHeight : 0
    maxScroll.current = Math.max(maxScroll.current, depth)

    emit("scroll", { scroll_depth: depth, velocity, jitter })

    lastScrollY.current = currentY
    lastScrollTs.current = t
  }, [emit])

  // =========================
  // 6. EVENTOS RICOS (INTENCIONALIDAD)
  // =========================

  const trackLike = useCallback(() => emit("like"), [emit])
  const trackShare = useCallback(() => emit("share"), [emit])
  const trackProfileClick = useCallback(() => emit("profile_click"), [emit])
  const trackMediaExpand = useCallback(() => emit("media_expand"), [emit])
  const trackCommentIntent = useCallback(() => emit("comment_intent"), [emit])

  // =========================
  // 7. LIMPIEZA FINAL (EXIT)
  // =========================

  useEffect(() => {
    return () => {
      // Sumamos el tiempo visible residual al desmontar
      if (visibleStart.current) {
        dwellTime.current += now() - visibleStart.current
      }
      
      emit("exit", {
        dwell_time: dwellTime.current / 1000,
        scroll_depth: maxScroll.current
      })
      
      // Forzamos el envío final usando keepalive
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

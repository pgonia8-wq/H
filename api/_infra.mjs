import { getMetrics } from "./_metrics.mjs";

const STATES = {
  NORMAL: "NORMAL",
  STRESS: "STRESS",
  CRITICAL: "CRITICAL",
  LOCKDOWN: "LOCKDOWN",
  STABILIZATION: "STABILIZATION",
  HARD_SAFE: "HARD_SAFE",
};

const state = {
  current: STATES.NORMAL,
  since: Date.now(),
  auto: true,
  criticalSince: null,
  lockdownSince: null,
  history: [],
  gpi: 0,
  gpiHistory: [],
  config: {
    stressLatencyP95: 200,
    stressErrorRate: 3,
    stressDbConnections: 70,
    criticalDbUsage: 80,
    criticalErrorRate: 10,
    criticalQueueSize: 50000,
    lockdownAutoSec: 300,
    stabilizationAfterCriticalSec: 120,
    hardSafeAfterLockdownSec: 300,
    recoveryErrorRate: 2,
    recoveryLatencyP95: 150,
    recoveryDbUsage: 70,
    gpiWeights: { queueSize: 0.20, dbLatency: 0.25, errorRate: 0.25, rps: 0.15, connectionSat: 0.15 },
  },
  cache: { enabled: false, feedTTL: 0, profileTTL: 0, tokenTTL: 0 },
  batch: { enabled: false, likesBuffer: [], postsBuffer: [] },
  feedRefreshMs: 3000,
  realtimeEnabled: true,
  socialWritesAllowed: true,
  tradingAllowed: true,
  queueSocialWrites: false,
  dbWriteReduction: 0,
  aggressiveBatching: false,
};

const PRIORITY = { TRADING: 1, FINANCIAL: 2, TOKEN_STATE: 3, QUEUE_PROCESSING: 4, SOCIAL: 5, UI_REALTIME: 6 };

function logTransition(from, to, reason) {
  const entry = { from, to, reason, ts: new Date().toISOString(), gpi: state.gpi };
  state.history.push(entry);
  if (state.history.length > 500) state.history = state.history.slice(-500);
  console.warn(JSON.stringify({ event: "INFRA_STATE_CHANGE", ...entry }));
}

function applyNormal() {
  state.cache.enabled = false;
  state.cache.feedTTL = 0;
  state.cache.profileTTL = 0;
  state.cache.tokenTTL = 0;
  state.batch.enabled = false;
  state.feedRefreshMs = 3000;
  state.realtimeEnabled = true;
  state.socialWritesAllowed = true;
  state.tradingAllowed = true;
  state.queueSocialWrites = false;
  state.dbWriteReduction = 0;
  state.aggressiveBatching = false;
}

function applyStress() {
  state.cache.enabled = true;
  state.cache.feedTTL = 12000;
  state.cache.profileTTL = 30000;
  state.cache.tokenTTL = 5000;
  state.batch.enabled = true;
  state.feedRefreshMs = 10000;
  state.realtimeEnabled = true;
  state.socialWritesAllowed = true;
  state.tradingAllowed = true;
  state.queueSocialWrites = false;
  state.dbWriteReduction = 0;
  state.aggressiveBatching = false;
}

function applyCritical() {
  state.cache.enabled = true;
  state.cache.feedTTL = 30000;
  state.cache.profileTTL = 60000;
  state.cache.tokenTTL = 10000;
  state.batch.enabled = true;
  state.feedRefreshMs = 30000;
  state.realtimeEnabled = false;
  state.socialWritesAllowed = true;
  state.tradingAllowed = true;
  state.queueSocialWrites = true;
  state.dbWriteReduction = 0;
  state.aggressiveBatching = false;
}

function applyLockdown() {
  state.cache.enabled = true;
  state.cache.feedTTL = 60000;
  state.cache.profileTTL = 120000;
  state.cache.tokenTTL = 30000;
  state.batch.enabled = false;
  state.feedRefreshMs = 60000;
  state.realtimeEnabled = false;
  state.socialWritesAllowed = false;
  state.tradingAllowed = true;
  state.queueSocialWrites = false;
  state.dbWriteReduction = 50;
  state.aggressiveBatching = false;
}

function applyStabilization() {
  state.cache.enabled = true;
  state.cache.feedTTL = 45000;
  state.cache.profileTTL = 90000;
  state.cache.tokenTTL = 15000;
  state.batch.enabled = true;
  state.feedRefreshMs = 45000;
  state.realtimeEnabled = false;
  state.socialWritesAllowed = false;
  state.tradingAllowed = true;
  state.queueSocialWrites = true;
  state.dbWriteReduction = 70;
  state.aggressiveBatching = true;
}

function applyHardSafe() {
  state.cache.enabled = true;
  state.cache.feedTTL = 120000;
  state.cache.profileTTL = 300000;
  state.cache.tokenTTL = 60000;
  state.batch.enabled = false;
  state.feedRefreshMs = 120000;
  state.realtimeEnabled = false;
  state.socialWritesAllowed = false;
  state.tradingAllowed = true;
  state.queueSocialWrites = true;
  state.dbWriteReduction = 90;
  state.aggressiveBatching = true;
}

const applyMap = {
  [STATES.NORMAL]: applyNormal,
  [STATES.STRESS]: applyStress,
  [STATES.CRITICAL]: applyCritical,
  [STATES.LOCKDOWN]: applyLockdown,
  [STATES.STABILIZATION]: applyStabilization,
  [STATES.HARD_SAFE]: applyHardSafe,
};

function setState(newState, reason = "manual") {
  if (newState === state.current) return;
  const old = state.current;
  state.current = newState;
  state.since = Date.now();
  if (newState === STATES.CRITICAL) state.criticalSince = state.criticalSince || Date.now();
  else if (newState !== STATES.STABILIZATION) state.criticalSince = null;
  if (newState === STATES.LOCKDOWN) state.lockdownSince = state.lockdownSince || Date.now();
  else if (newState !== STATES.HARD_SAFE) state.lockdownSince = null;
  applyMap[newState]();
  logTransition(old, newState, reason);
}

export function computeGPI(dbLatencyMs = 0, dbUsagePercent = 0, queueSize = 0) {
  const m = getMetrics();
  const w = state.config.gpiWeights;

  const queueScore = Math.min(100, (queueSize / 500000) * 100);
  const dbLatScore = Math.min(100, (dbLatencyMs / 1000) * 100);
  const errScore = Math.min(100, (m.errorRateNum || 0) * 10);
  const rpsScore = Math.min(100, (m.rps || 0) / 100 * 100);
  const connScore = Math.min(100, (dbUsagePercent / 100) * 100);

  const gpi = Math.round(
    queueScore * w.queueSize +
    dbLatScore * w.dbLatency +
    errScore * w.errorRate +
    rpsScore * w.rps +
    connScore * w.connectionSat
  );

  state.gpi = Math.min(100, Math.max(0, gpi));
  state.gpiHistory.push({ gpi: state.gpi, ts: Date.now() });
  if (state.gpiHistory.length > 300) state.gpiHistory = state.gpiHistory.slice(-300);

  return state.gpi;
}

function checkRecoveryConditions(m, dbUsagePercent) {
  return (
    (m.errorRateNum || 0) < state.config.recoveryErrorRate &&
    (m.p95 || 0) < state.config.recoveryLatencyP95 &&
    dbUsagePercent < state.config.recoveryDbUsage
  );
}

export function evaluateState(dbUsagePercent = 0, dbLatencyMs = 0, queueSize = 0) {
  if (!state.auto) return state.current;
  const m = getMetrics();
  const errRate = m.errorRateNum || 0;
  const p95 = m.p95 || 0;

  const gpi = computeGPI(dbLatencyMs, dbUsagePercent, queueSize);

  if (state.current === STATES.HARD_SAFE) {
    if (checkRecoveryConditions(m, dbUsagePercent)) {
      setState(STATES.STRESS, `auto-recovery: metrics stable (err=${errRate.toFixed(1)}% p95=${p95}ms db=${dbUsagePercent}%)`);
    }
    return state.current;
  }

  if (state.current === STATES.STABILIZATION) {
    if (checkRecoveryConditions(m, dbUsagePercent)) {
      setState(STATES.STRESS, `auto-recovery: stabilization complete (err=${errRate.toFixed(1)}%)`);
    } else if (state.criticalSince) {
      const criticalElapsed = (Date.now() - state.criticalSince) / 1000;
      if (criticalElapsed > state.config.lockdownAutoSec) {
        setState(STATES.LOCKDOWN, `auto: stabilization failed, critical for ${Math.round(criticalElapsed)}s`);
      }
    }
    return state.current;
  }

  if (state.current === STATES.LOCKDOWN && state.lockdownSince) {
    const lockdownElapsed = (Date.now() - state.lockdownSince) / 1000;
    if (lockdownElapsed > state.config.hardSafeAfterLockdownSec) {
      setState(STATES.HARD_SAFE, `auto: lockdown for ${Math.round(lockdownElapsed)}s → hard safe mode`);
      return state.current;
    }
    if (checkRecoveryConditions(m, dbUsagePercent)) {
      setState(STATES.STRESS, `auto-recovery: lockdown resolved (err=${errRate.toFixed(1)}%)`);
    }
    return state.current;
  }

  if (state.current === STATES.CRITICAL && state.criticalSince) {
    const criticalElapsed = (Date.now() - state.criticalSince) / 1000;
    if (criticalElapsed > state.config.stabilizationAfterCriticalSec) {
      setState(STATES.STABILIZATION, `auto: critical for ${Math.round(criticalElapsed)}s → stabilization`);
      return state.current;
    }
  }

  if (gpi >= 90) {
    if (state.current !== STATES.LOCKDOWN && state.current !== STATES.HARD_SAFE) {
      setState(STATES.LOCKDOWN, `auto: GPI=${gpi} (>=90)`);
    }
  } else if (gpi >= 75 || dbUsagePercent > state.config.criticalDbUsage || errRate > state.config.criticalErrorRate || queueSize > state.config.criticalQueueSize) {
    if (state.current !== STATES.CRITICAL && state.current !== STATES.LOCKDOWN && state.current !== STATES.STABILIZATION) {
      setState(STATES.CRITICAL, `auto: GPI=${gpi} dbUsage=${dbUsagePercent}% errRate=${errRate.toFixed(1)}% queue=${queueSize}`);
    }
  } else if (gpi >= 50 || p95 > state.config.stressLatencyP95 || errRate > state.config.stressErrorRate || dbUsagePercent > state.config.stressDbConnections) {
    if (state.current === STATES.NORMAL) {
      setState(STATES.STRESS, `auto: GPI=${gpi} p95=${p95}ms errRate=${errRate.toFixed(1)}%`);
    }
    if (state.current === STATES.CRITICAL) {
      setState(STATES.STRESS, `auto: recovering from critical GPI=${gpi}`);
    }
  } else {
    if (state.current === STATES.STRESS) {
      setState(STATES.NORMAL, `auto: GPI=${gpi} metrics recovered`);
    }
    if (state.current === STATES.CRITICAL) {
      setState(STATES.STRESS, `auto: recovering from critical GPI=${gpi}`);
    }
  }

  return state.current;
}

export function forceState(newState, reason = "admin_override") {
  state.auto = false;
  setState(newState, reason);
}

export function enableAutoState() {
  state.auto = true;
}

export function getSystemState() {
  return {
    state: state.current,
    since: new Date(state.since).toISOString(),
    uptimeInState: Math.round((Date.now() - state.since) / 1000),
    auto: state.auto,
    gpi: state.gpi,
    gpiHistory: state.gpiHistory.slice(-60),
    cache: { ...state.cache },
    feedRefreshMs: state.feedRefreshMs,
    realtimeEnabled: state.realtimeEnabled,
    socialWritesAllowed: state.socialWritesAllowed,
    tradingAllowed: state.tradingAllowed,
    queueSocialWrites: state.queueSocialWrites,
    batchEnabled: state.batch.enabled,
    dbWriteReduction: state.dbWriteReduction,
    aggressiveBatching: state.aggressiveBatching,
    config: { ...state.config },
    history: state.history.slice(-50),
  };
}

export function updateConfig(updates) {
  Object.assign(state.config, updates);
}

export function canTrade() {
  return state.tradingAllowed;
}

export function canSocialWrite() {
  return state.socialWritesAllowed;
}

export function shouldQueueSocial() {
  return state.queueSocialWrites;
}

export function isRealtimeEnabled() {
  return state.realtimeEnabled;
}

export function getCacheTTL(type) {
  if (!state.cache.enabled) return 0;
  return state.cache[type + "TTL"] || 0;
}

export function getFeedRefreshMs() {
  return state.feedRefreshMs;
}

export function isBatchEnabled() {
  return state.batch.enabled;
}

export function getDbWriteReduction() {
  return state.dbWriteReduction;
}

export function isAggressiveBatching() {
  return state.aggressiveBatching;
}

export function getGPI() {
  return state.gpi;
}

const responseCache = new Map();
const CACHE_CLEANUP_INTERVAL = 30000;
let lastCacheCleanup = Date.now();

export function getCached(key, ttlMs) {
  if (!state.cache.enabled || ttlMs <= 0) return null;
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data) {
  if (!state.cache.enabled) return;
  responseCache.set(key, { data, ts: Date.now() });
  if (Date.now() - lastCacheCleanup > CACHE_CLEANUP_INTERVAL) {
    lastCacheCleanup = Date.now();
    for (const [k, v] of responseCache) {
      if (Date.now() - v.ts > 120000) responseCache.delete(k);
    }
  }
}

export function operationPriority(type) {
  switch (type) {
    case "BUY": case "SELL": return PRIORITY.TRADING;
    case "BALANCE": case "PAYOUT": return PRIORITY.FINANCIAL;
    case "TOKEN_STATE": return PRIORITY.TOKEN_STATE;
    case "QUEUE": return PRIORITY.QUEUE_PROCESSING;
    case "POST": case "LIKE": case "DELETE": case "REPORT": return PRIORITY.SOCIAL;
    case "FEED": case "REALTIME": return PRIORITY.UI_REALTIME;
    default: return PRIORITY.SOCIAL;
  }
}

export function shouldThrottle(opType) {
  const priority = operationPriority(opType);
  if (state.current === STATES.HARD_SAFE && priority > PRIORITY.TRADING) return true;
  if (state.current === STATES.STABILIZATION && priority >= PRIORITY.UI_REALTIME) return true;
  if (state.current === STATES.LOCKDOWN && priority >= PRIORITY.SOCIAL) return true;
  if (state.current === STATES.CRITICAL && priority >= PRIORITY.UI_REALTIME) return true;
  return false;
}

export function getLogSampleRate() {
  switch (state.current) {
    case STATES.NORMAL: return 1.0;
    case STATES.STRESS: return 0.5;
    case STATES.CRITICAL: return 0.2;
    case STATES.STABILIZATION: return 0.15;
    case STATES.LOCKDOWN: return 0.1;
    case STATES.HARD_SAFE: return 0.1;
    default: return 1.0;
  }
}

export function getUxHints() {
  const hints = {
    systemState: state.current,
    gpi: state.gpi,
    tradingAvailable: state.tradingAllowed,
    socialAvailable: state.socialWritesAllowed,
    realtimeActive: state.realtimeEnabled,
    feedRefreshMs: state.feedRefreshMs,
    messages: [],
  };

  switch (state.current) {
    case STATES.STRESS:
      hints.messages.push({ type: "info", text: "System is under heavy load. Some actions may be delayed." });
      break;
    case STATES.CRITICAL:
      hints.messages.push({ type: "warning", text: "System is under heavy load. Your action is queued for processing." });
      hints.messages.push({ type: "info", text: "Trading executing normally." });
      break;
    case STATES.STABILIZATION:
      hints.messages.push({ type: "warning", text: "System is stabilizing. Social features temporarily queued." });
      hints.messages.push({ type: "info", text: "Trading executing normally." });
      break;
    case STATES.LOCKDOWN:
      hints.messages.push({ type: "danger", text: "System under maintenance. Feed is read-only." });
      hints.messages.push({ type: "info", text: "Trading remains available." });
      break;
    case STATES.HARD_SAFE:
      hints.messages.push({ type: "danger", text: "Emergency mode active. Only trading operations available." });
      hints.messages.push({ type: "warning", text: "Social features will resume when system recovers." });
      break;
  }

  return hints;
}

export { STATES, PRIORITY };

import { getMetrics } from "./_metrics.mjs";

const STATES = { NORMAL: "NORMAL", STRESS: "STRESS", CRITICAL: "CRITICAL", LOCKDOWN: "LOCKDOWN" };

const state = {
  current: STATES.NORMAL,
  since: Date.now(),
  auto: true,
  criticalSince: null,
  history: [],
  config: {
    stressLatencyP95: 200,
    stressErrorRate: 3,
    criticalDbUsage: 80,
    criticalErrorRate: 10,
    lockdownAutoSec: 300,
  },
  cache: {
    enabled: false,
    feedTTL: 0,
    profileTTL: 0,
    tokenTTL: 0,
  },
  batch: {
    enabled: false,
    likesBuffer: [],
    postsBuffer: [],
  },
  feedRefreshMs: 3000,
  realtimeEnabled: true,
  socialWritesAllowed: true,
  tradingAllowed: true,
  queueSocialWrites: false,
};

const PRIORITY = { TRADING: 1, FINANCIAL: 2, TOKEN_STATE: 3, SOCIAL: 4, UI_REALTIME: 5 };

function logTransition(from, to, reason) {
  const entry = { from, to, reason, ts: new Date().toISOString() };
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
}

function applyStress() {
  state.cache.enabled = true;
  state.cache.feedTTL = 10000;
  state.cache.profileTTL = 30000;
  state.cache.tokenTTL = 5000;
  state.batch.enabled = true;
  state.feedRefreshMs = 10000;
  state.realtimeEnabled = true;
  state.socialWritesAllowed = true;
  state.tradingAllowed = true;
  state.queueSocialWrites = false;
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
  state.tradingAllowed = false;
  state.queueSocialWrites = false;
}

const applyMap = {
  [STATES.NORMAL]: applyNormal,
  [STATES.STRESS]: applyStress,
  [STATES.CRITICAL]: applyCritical,
  [STATES.LOCKDOWN]: applyLockdown,
};

function setState(newState, reason = "manual") {
  if (newState === state.current) return;
  const old = state.current;
  state.current = newState;
  state.since = Date.now();
  if (newState === STATES.CRITICAL) state.criticalSince = state.criticalSince || Date.now();
  else state.criticalSince = null;
  applyMap[newState]();
  logTransition(old, newState, reason);
}

export function evaluateState(dbUsagePercent = 0) {
  if (!state.auto) return state.current;
  const m = getMetrics();
  const errRate = m.errorRateNum || 0;
  const p95 = m.p95 || 0;

  if (state.current === STATES.CRITICAL && state.criticalSince) {
    const elapsed = (Date.now() - state.criticalSince) / 1000;
    if (elapsed > state.config.lockdownAutoSec) {
      setState(STATES.LOCKDOWN, `auto: critical for ${Math.round(elapsed)}s`);
      return state.current;
    }
  }

  if (dbUsagePercent > state.config.criticalDbUsage || errRate > state.config.criticalErrorRate) {
    if (state.current !== STATES.CRITICAL && state.current !== STATES.LOCKDOWN) {
      setState(STATES.CRITICAL, `auto: dbUsage=${dbUsagePercent}% errRate=${errRate.toFixed(1)}%`);
    }
  } else if (p95 > state.config.stressLatencyP95 || errRate > state.config.stressErrorRate) {
    if (state.current === STATES.NORMAL) {
      setState(STATES.STRESS, `auto: p95=${p95}ms errRate=${errRate.toFixed(1)}%`);
    }
    if (state.current === STATES.CRITICAL) {
      setState(STATES.STRESS, `auto: recovering from critical`);
    }
  } else {
    if (state.current === STATES.STRESS) {
      setState(STATES.NORMAL, `auto: metrics recovered p95=${p95}ms errRate=${errRate.toFixed(1)}%`);
    }
    if (state.current === STATES.CRITICAL) {
      setState(STATES.STRESS, `auto: recovering from critical`);
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
    cache: { ...state.cache },
    feedRefreshMs: state.feedRefreshMs,
    realtimeEnabled: state.realtimeEnabled,
    socialWritesAllowed: state.socialWritesAllowed,
    tradingAllowed: state.tradingAllowed,
    queueSocialWrites: state.queueSocialWrites,
    batchEnabled: state.batch.enabled,
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
    case "POST": case "LIKE": case "DELETE": case "REPORT": return PRIORITY.SOCIAL;
    case "FEED": case "REALTIME": return PRIORITY.UI_REALTIME;
    default: return PRIORITY.SOCIAL;
  }
}

export function shouldThrottle(opType) {
  const priority = operationPriority(opType);
  if (state.current === STATES.CRITICAL && priority >= PRIORITY.UI_REALTIME) return true;
  if (state.current === STATES.LOCKDOWN && priority >= PRIORITY.SOCIAL) return true;
  return false;
}

export { STATES, PRIORITY };

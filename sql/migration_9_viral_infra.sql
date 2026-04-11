-- migration_9_viral_infra.sql
-- Viral-grade infrastructure: operation queue, system logs, system state

-- 1. Operation Queue (absorb traffic spikes)
CREATE TABLE IF NOT EXISTS operation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL', 'LIKE', 'POST', 'DELETE')),
  payload JSONB NOT NULL DEFAULT '{}',
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DONE', 'FAILED')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  retries INTEGER DEFAULT 0,
  error_message TEXT,
  next_retry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_queue_status_priority ON operation_queue(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_queue_user ON operation_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_type ON operation_queue(type, status);

-- 2. System Logs (Datadog-style structured tracing)
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_id TEXT NOT NULL,
  span TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TRADE', 'SOCIAL', 'ERROR', 'SYSTEM', 'RATE_LIMIT', 'INFRA')),
  latency INTEGER DEFAULT 0,
  user_id TEXT,
  token TEXT,
  status TEXT,
  endpoint TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_syslog_trace ON system_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_syslog_user ON system_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_syslog_token ON system_logs(token, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_syslog_type ON system_logs(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_syslog_created ON system_logs(created_at DESC);

-- 3. System State History (for persistence across restarts)
CREATE TABLE IF NOT EXISTS system_state_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  previous_state TEXT,
  reason TEXT,
  triggered_by TEXT DEFAULT 'auto',
  metrics_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_state_log_created ON system_state_log(created_at DESC);

-- 4. Cleanup: auto-purge old queue items (keep 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_queue_items()
RETURNS void AS $$
BEGIN
  DELETE FROM operation_queue
  WHERE status IN ('DONE', 'FAILED')
    AND created_at < NOW() - INTERVAL '7 days';

  DELETE FROM system_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 5. Queue stats helper
CREATE OR REPLACE FUNCTION queue_stats()
RETURNS TABLE(status TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
    SELECT oq.status, COUNT(*)::BIGINT
    FROM operation_queue oq
    GROUP BY oq.status;
END;
$$ LANGUAGE plpgsql;

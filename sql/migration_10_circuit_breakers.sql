-- Migration 10: Circuit Breaker + GPI system support
-- Circuit breakers are in-memory (no SQL tables needed)
-- GPI is computed in-memory from existing metrics
-- This migration adds a system_config table for persisting infra settings

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_config_updated ON system_config(updated_at DESC);

INSERT INTO system_config (key, value) VALUES 
  ('infra_state', '{"current": "NORMAL", "auto": true}'::jsonb),
  ('gpi_thresholds', '{"normal": 50, "stress": 75, "critical": 90}'::jsonb),
  ('backpressure_thresholds', '{"drop_low": 50000, "drop_medium": 100000, "trading_only": 250000, "social_disabled": 500000, "hard_lockdown": 1000000}'::jsonb),
  ('circuit_breaker_config', '{"trading": {"failureThreshold": 5, "windowMs": 60000, "cooldownMs": 30000}, "social": {"failureThreshold": 10, "windowMs": 60000, "cooldownMs": 20000}, "db": {"failureThreshold": 3, "windowMs": 30000, "cooldownMs": 15000, "latencyThresholdMs": 500}}'::jsonb)
ON CONFLICT (key) DO NOTHING;

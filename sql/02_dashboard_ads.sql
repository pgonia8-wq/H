-- ============================================================================
-- 02 — DASHBOARD: CAMPAÑAS PUBLICITARIAS Y AD TRACKING
-- Ejecutar en Supabase SQL Editor (una sola vez, después de 01)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLA: campaigns (campañas publicitarias — presupuesto pagado via MiniKit)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  name text NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  cpc numeric NOT NULL DEFAULT 0.01,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  transaction_id text UNIQUE,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_tx ON campaigns (transaction_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLA: ad_metrics (impresiones y clicks — insertados por api/trackAd.mjs)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  user_id text,
  type text NOT NULL CHECK (type IN ('impression', 'click')),
  value numeric NOT NULL DEFAULT 0,
  creator_earning numeric NOT NULL DEFAULT 0,
  platform_earning numeric NOT NULL DEFAULT 0,
  country text DEFAULT 'unknown',
  language text DEFAULT 'unknown',
  interests text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_metrics_post ON ad_metrics (post_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign ON ad_metrics (campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_type ON ad_metrics (type);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_created ON ad_metrics (created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLA: profiles → wallet_address (para pagar a creadores on-chain)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wallet_address text;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VISTA: campaign_stats (métricas agregadas por campaña — para el dashboard)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW campaign_stats AS
SELECT
  c.id,
  c.user_id,
  c.name,
  c.budget,
  c.spent,
  c.status,
  c.created_at,
  COALESCE(clicks.cnt, 0) AS clicks,
  COALESCE(imps.cnt, 0) AS impressions
FROM campaigns c
LEFT JOIN (
  SELECT campaign_id, COUNT(*) AS cnt
  FROM ad_metrics WHERE type = 'click'
  GROUP BY campaign_id
) clicks ON clicks.campaign_id = c.id
LEFT JOIN (
  SELECT campaign_id, COUNT(*) AS cnt
  FROM ad_metrics WHERE type = 'impression'
  GROUP BY campaign_id
) imps ON imps.campaign_id = c.id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS (Row Level Security) — proteger datos de campañas
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own campaigns" ON campaigns;
CREATE POLICY "Users see own campaigns" ON campaigns
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Service role full access campaigns" ON campaigns;
CREATE POLICY "Service role full access campaigns" ON campaigns
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access ad_metrics" ON ad_metrics;
CREATE POLICY "Service role full access ad_metrics" ON ad_metrics
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users see own ad_metrics" ON ad_metrics;
CREATE POLICY "Users see own ad_metrics" ON ad_metrics
  FOR SELECT USING (
    campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid()::text)
  );

-- ============================================================================
-- FIN — 02_dashboard_ads.sql
-- ============================================================================

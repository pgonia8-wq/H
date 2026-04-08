-- ═══════════════════════════════════════════════════════════════════
-- HABILITAR RLS EN LAS 28 TABLAS QUE ESTÁN SIN PROTECCIÓN
-- 
-- Generado desde auditoría en vivo de Supabase.
-- Cada tabla tiene policies según su uso (frontend vs backend).
-- Service_role key SIEMPRE bypasea RLS automáticamente.
-- 
-- IMPORTANTE: Correr en orden. Seguro de repetir (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- SECCIÓN 1: TABLAS CON ESCRITURA FRONTEND (anon key)
-- Necesitan policies permisivas para que la app funcione
-- ═══════════════════════════════════════════════════════════════════


-- ─── chat_reactions ───
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_reactions_select" ON chat_reactions FOR SELECT USING (true);
CREATE POLICY "chat_reactions_insert" ON chat_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_reactions_delete" ON chat_reactions FOR DELETE USING (true);

-- ─── chat_pins ───
ALTER TABLE chat_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_pins_select" ON chat_pins FOR SELECT USING (true);
CREATE POLICY "chat_pins_insert" ON chat_pins FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_pins_delete" ON chat_pins FOR DELETE USING (true);

-- ─── chat_subscriptions ───
ALTER TABLE chat_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_subscriptions_select" ON chat_subscriptions FOR SELECT USING (true);
CREATE POLICY "chat_subscriptions_insert" ON chat_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_subscriptions_delete" ON chat_subscriptions FOR DELETE USING (true);

-- ─── reposts ───
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reposts_select" ON reposts FOR SELECT USING (true);
CREATE POLICY "reposts_insert" ON reposts FOR INSERT WITH CHECK (true);
CREATE POLICY "reposts_delete" ON reposts FOR DELETE USING (true);

-- ─── conversations ───
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (true);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);

-- ─── typing_users ───
ALTER TABLE typing_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "typing_users_select" ON typing_users FOR SELECT USING (true);
CREATE POLICY "typing_users_insert" ON typing_users FOR INSERT WITH CHECK (true);
CREATE POLICY "typing_users_delete" ON typing_users FOR DELETE USING (true);

-- ─── followers ───
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "followers_select" ON followers FOR SELECT USING (true);
CREATE POLICY "followers_insert" ON followers FOR INSERT WITH CHECK (true);
CREATE POLICY "followers_delete" ON followers FOR DELETE USING (true);

-- ─── connected_users ───
ALTER TABLE connected_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connected_users_select" ON connected_users FOR SELECT USING (true);
CREATE POLICY "connected_users_insert" ON connected_users FOR INSERT WITH CHECK (true);
CREATE POLICY "connected_users_update" ON connected_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "connected_users_delete" ON connected_users FOR DELETE USING (true);

-- ─── boost_events ───
ALTER TABLE boost_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boost_events_select" ON boost_events FOR SELECT USING (true);
CREATE POLICY "boost_events_insert" ON boost_events FOR INSERT WITH CHECK (true);

-- ─── token_purchases ───
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "token_purchases_select" ON token_purchases FOR SELECT USING (true);
CREATE POLICY "token_purchases_insert" ON token_purchases FOR INSERT WITH CHECK (true);

-- ─── user_token_holdings ───
ALTER TABLE user_token_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_token_holdings_select" ON user_token_holdings FOR SELECT USING (true);
CREATE POLICY "user_token_holdings_insert" ON user_token_holdings FOR INSERT WITH CHECK (true);
CREATE POLICY "user_token_holdings_update" ON user_token_holdings FOR UPDATE USING (true) WITH CHECK (true);

-- ─── subscriptionschat ───
ALTER TABLE subscriptionschat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptionschat_select" ON subscriptionschat FOR SELECT USING (true);
CREATE POLICY "subscriptionschat_insert" ON subscriptionschat FOR INSERT WITH CHECK (true);
CREATE POLICY "subscriptionschat_update" ON subscriptionschat FOR UPDATE USING (true) WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════
-- SECCIÓN 2: TABLAS BACKEND-ONLY (service_role key)
-- RLS ON + solo SELECT para anon. Service_role bypasea automáticamente.
-- ═══════════════════════════════════════════════════════════════════


-- ─── ad_campaigns ───
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT USING (true);

-- ─── ad_events ───
ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad_events_select" ON ad_events FOR SELECT USING (true);

-- ─── ad_metrics ───
ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad_metrics_select" ON ad_metrics FOR SELECT USING (true);

-- ─── ad_targets ───
ALTER TABLE ad_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad_targets_select" ON ad_targets FOR SELECT USING (true);

-- ─── campaigns ───
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_select" ON campaigns FOR SELECT USING (true);

-- ─── community_pool ───
ALTER TABLE community_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_pool_select" ON community_pool FOR SELECT USING (true);

-- ─── creator_monthly_pool ───
ALTER TABLE creator_monthly_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creator_monthly_pool_select" ON creator_monthly_pool FOR SELECT USING (true);

-- ─── creator_subscriptions ───
ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creator_subscriptions_select" ON creator_subscriptions FOR SELECT USING (true);

-- ─── earnings_ledger ───
ALTER TABLE earnings_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "earnings_ledger_select" ON earnings_ledger FOR SELECT USING (true);

-- ─── feed ───
ALTER TABLE feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_select" ON feed FOR SELECT USING (true);

-- ─── official_accounts ───
ALTER TABLE official_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "official_accounts_select" ON official_accounts FOR SELECT USING (true);

-- ─── platform_config ───
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_config_select" ON platform_config FOR SELECT USING (true);

-- ─── post_ads ───
ALTER TABLE post_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_ads_select" ON post_ads FOR SELECT USING (true);

-- ─── post_boosts ───
ALTER TABLE post_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_boosts_select" ON post_boosts FOR SELECT USING (true);

-- ─── rooms ───
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (true);

-- ─── user_earnings_generated ───
ALTER TABLE user_earnings_generated ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_earnings_generated_select" ON user_earnings_generated FOR SELECT USING (true);


-- ═══════════════════════════════════════════════════════════════════
-- LIMPIEZA: Borrar función temporal de auditoría
-- ═══════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS _temp_rls_audit();

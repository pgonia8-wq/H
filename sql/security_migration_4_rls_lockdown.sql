-- ═══════════════════════════════════════════════════════════════
  -- SECURITY MIGRATION 4: RLS Lockdown + UNIQUE constraints
  -- Date: 2026-04-10
  -- Purpose: Drop all permissive INSERT/UPDATE/DELETE policies on financial tables
  --          Add UNIQUE constraints for dedup
  --          Add credit_balance RPC for sell endpoints
  -- ═══════════════════════════════════════════════════════════════

  -- ───────────────────────────────────────────────────────────────
  -- 1. DROP PERMISSIVE WRITE POLICIES ON FINANCIAL TABLES
  -- These allow any anon user to INSERT/UPDATE/DELETE directly
  -- ───────────────────────────────────────────────────────────────

  -- holdings / user_token_holdings
  DROP POLICY IF EXISTS "user_token_holdings_insert" ON holdings;
  DROP POLICY IF EXISTS "user_token_holdings_update" ON holdings;
  DROP POLICY IF EXISTS "user_token_holdings_delete" ON holdings;
  DROP POLICY IF EXISTS "holdings_insert" ON holdings;
  DROP POLICY IF EXISTS "holdings_update" ON holdings;
  DROP POLICY IF EXISTS "holdings_delete" ON holdings;
  DROP POLICY IF EXISTS "Enable insert for all users" ON holdings;
  DROP POLICY IF EXISTS "Enable update for all users" ON holdings;
  DROP POLICY IF EXISTS "Enable delete for all users" ON holdings;

  -- user_balances
  DROP POLICY IF EXISTS "user_balances_insert" ON user_balances;
  DROP POLICY IF EXISTS "user_balances_update" ON user_balances;
  DROP POLICY IF EXISTS "user_balances_delete" ON user_balances;
  DROP POLICY IF EXISTS "Enable insert for all users" ON user_balances;
  DROP POLICY IF EXISTS "Enable update for all users" ON user_balances;

  -- balances
  DROP POLICY IF EXISTS "balances_insert" ON balances;
  DROP POLICY IF EXISTS "balances_update" ON balances;
  DROP POLICY IF EXISTS "balances_delete" ON balances;
  DROP POLICY IF EXISTS "Enable insert for all users" ON balances;
  DROP POLICY IF EXISTS "Enable update for all users" ON balances;

  -- payment_orders
  DROP POLICY IF EXISTS "payment_orders_insert" ON payment_orders;
  DROP POLICY IF EXISTS "payment_orders_update" ON payment_orders;
  DROP POLICY IF EXISTS "payment_orders_delete" ON payment_orders;
  DROP POLICY IF EXISTS "Enable insert for all users" ON payment_orders;
  DROP POLICY IF EXISTS "Enable update for all users" ON payment_orders;

  -- tokens
  DROP POLICY IF EXISTS "tokens_insert" ON tokens;
  DROP POLICY IF EXISTS "tokens_update" ON tokens;
  DROP POLICY IF EXISTS "tokens_delete" ON tokens;
  DROP POLICY IF EXISTS "Enable insert for all users" ON tokens;
  DROP POLICY IF EXISTS "Enable update for all users" ON tokens;

  -- withdrawals
  DROP POLICY IF EXISTS "withdrawals_insert" ON withdrawals;
  DROP POLICY IF EXISTS "withdrawals_update" ON withdrawals;
  DROP POLICY IF EXISTS "Enable insert for all users" ON withdrawals;
  DROP POLICY IF EXISTS "Enable update for all users" ON withdrawals;

  -- airdrop_claims
  DROP POLICY IF EXISTS "airdrop_claims_insert" ON airdrop_claims;
  DROP POLICY IF EXISTS "airdrop_claims_update" ON airdrop_claims;
  DROP POLICY IF EXISTS "Enable insert for all users" ON airdrop_claims;
  DROP POLICY IF EXISTS "Enable update for all users" ON airdrop_claims;

  -- airdrop_links
  DROP POLICY IF EXISTS "airdrop_links_insert" ON airdrop_links;
  DROP POLICY IF EXISTS "airdrop_links_update" ON airdrop_links;
  DROP POLICY IF EXISTS "Enable insert for all users" ON airdrop_links;
  DROP POLICY IF EXISTS "Enable update for all users" ON airdrop_links;

  -- airdrop_pools
  DROP POLICY IF EXISTS "airdrop_pools_insert" ON airdrop_pools;
  DROP POLICY IF EXISTS "airdrop_pools_update" ON airdrop_pools;
  DROP POLICY IF EXISTS "Enable insert for all users" ON airdrop_pools;
  DROP POLICY IF EXISTS "Enable update for all users" ON airdrop_pools;

  -- airdrops
  DROP POLICY IF EXISTS "airdrops_insert" ON airdrops;
  DROP POLICY IF EXISTS "airdrops_update" ON airdrops;
  DROP POLICY IF EXISTS "Enable insert for all users" ON airdrops;
  DROP POLICY IF EXISTS "Enable update for all users" ON airdrops;

  -- token_activity
  DROP POLICY IF EXISTS "token_activity_insert" ON token_activity;
  DROP POLICY IF EXISTS "token_activity_update" ON token_activity;
  DROP POLICY IF EXISTS "Enable insert for all users" ON token_activity;
  DROP POLICY IF EXISTS "Enable update for all users" ON token_activity;

  -- token_purchases
  DROP POLICY IF EXISTS "token_purchases_insert" ON token_purchases;
  DROP POLICY IF EXISTS "token_purchases_update" ON token_purchases;
  DROP POLICY IF EXISTS "Enable insert for all users" ON token_purchases;

  -- token_payments
  DROP POLICY IF EXISTS "token_payments_insert" ON token_payments;
  DROP POLICY IF EXISTS "token_payments_update" ON token_payments;
  DROP POLICY IF EXISTS "Enable insert for all users" ON token_payments;

  -- user_tokens
  DROP POLICY IF EXISTS "user_tokens_insert" ON user_tokens;
  DROP POLICY IF EXISTS "user_tokens_update" ON user_tokens;
  DROP POLICY IF EXISTS "Enable insert for all users" ON user_tokens;
  DROP POLICY IF EXISTS "Enable update for all users" ON user_tokens;

  -- system_locks
  DROP POLICY IF EXISTS "system_locks_insert" ON system_locks;
  DROP POLICY IF EXISTS "system_locks_update" ON system_locks;
  DROP POLICY IF EXISTS "Enable insert for all users" ON system_locks;
  DROP POLICY IF EXISTS "Enable update for all users" ON system_locks;

  -- profiles — restrict INSERT so verification_level cannot be set by anon
  DROP POLICY IF EXISTS "profiles_insert" ON profiles;
  DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;

  -- posts — restrict direct INSERT/UPDATE from anon
  DROP POLICY IF EXISTS "posts_insert" ON posts;
  DROP POLICY IF EXISTS "posts_update" ON posts;
  DROP POLICY IF EXISTS "Enable insert for all users" ON posts;
  DROP POLICY IF EXISTS "Enable update for all users" ON posts;

  -- user_reputation
  DROP POLICY IF EXISTS "user_reputation_insert" ON user_reputation;
  DROP POLICY IF EXISTS "user_reputation_update" ON user_reputation;
  DROP POLICY IF EXISTS "Enable insert for all users" ON user_reputation;

  -- boost_events
  DROP POLICY IF EXISTS "boost_events_insert" ON boost_events;
  DROP POLICY IF EXISTS "Enable insert for all users" ON boost_events;

  -- notifications
  DROP POLICY IF EXISTS "notifications_insert" ON notifications;
  DROP POLICY IF EXISTS "notifications_update" ON notifications;
  DROP POLICY IF EXISTS "Enable insert for all users" ON notifications;
  DROP POLICY IF EXISTS "Enable update for all users" ON notifications;

  -- reports
  DROP POLICY IF EXISTS "reports_insert" ON reports;
  DROP POLICY IF EXISTS "Enable insert for all users" ON reports;

  -- blocks
  DROP POLICY IF EXISTS "blocks_insert" ON blocks;
  DROP POLICY IF EXISTS "Enable insert for all users" ON blocks;

  -- likes
  DROP POLICY IF EXISTS "likes_insert" ON likes;
  DROP POLICY IF EXISTS "likes_update" ON likes;
  DROP POLICY IF EXISTS "likes_delete" ON likes;
  DROP POLICY IF EXISTS "Enable insert for all users" ON likes;
  DROP POLICY IF EXISTS "Enable update for all users" ON likes;
  DROP POLICY IF EXISTS "Enable delete for all users" ON likes;

  -- follows
  DROP POLICY IF EXISTS "follows_insert" ON follows;
  DROP POLICY IF EXISTS "follows_update" ON follows;
  DROP POLICY IF EXISTS "follows_delete" ON follows;
  DROP POLICY IF EXISTS "Enable insert for all users" ON follows;
  DROP POLICY IF EXISTS "Enable update for all users" ON follows;
  DROP POLICY IF EXISTS "Enable delete for all users" ON follows;

  -- trends_cache
  DROP POLICY IF EXISTS "trends_cache_insert" ON trends_cache;
  DROP POLICY IF EXISTS "trends_cache_update" ON trends_cache;
  DROP POLICY IF EXISTS "Enable insert for all users" ON trends_cache;
  DROP POLICY IF EXISTS "Enable update for all users" ON trends_cache;

  -- ───────────────────────────────────────────────────────────────
  -- 2. CREATE RESTRICTIVE READ-ONLY POLICIES FOR ANON
  -- Only SELECT allowed via anon key; all writes go through service_role (server-side)
  -- ───────────────────────────────────────────────────────────────

  -- Financial tables: anon can only SELECT
  CREATE POLICY "anon_read_holdings" ON holdings FOR SELECT USING (true);
  CREATE POLICY "anon_read_user_balances" ON user_balances FOR SELECT USING (auth.uid()::text = user_id);
  CREATE POLICY "anon_read_tokens" ON tokens FOR SELECT USING (true);
  CREATE POLICY "anon_read_payment_orders" ON payment_orders FOR SELECT USING (auth.uid()::text = user_id);
  CREATE POLICY "anon_read_token_activity" ON token_activity FOR SELECT USING (true);

  -- Social tables: anon can read + own-row writes for interactive features
  CREATE POLICY "anon_read_profiles" ON profiles FOR SELECT USING (true);
  CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT WITH CHECK (
    auth.uid()::text = id AND (verification_level IS NULL OR verification_level = 'device')
  );
  CREATE POLICY "anon_update_own_profile" ON profiles FOR UPDATE USING (
    auth.uid()::text = id
  ) WITH CHECK (
    verification_level IS DISTINCT FROM 'orb'
  );

  CREATE POLICY "anon_read_posts" ON posts FOR SELECT USING (true);
  CREATE POLICY "anon_read_likes" ON likes FOR SELECT USING (true);
  CREATE POLICY "anon_own_likes" ON likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  CREATE POLICY "anon_delete_own_likes" ON likes FOR DELETE USING (auth.uid()::text = user_id);

  CREATE POLICY "anon_read_follows" ON follows FOR SELECT USING (true);
  CREATE POLICY "anon_own_follows" ON follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id);
  CREATE POLICY "anon_delete_own_follows" ON follows FOR DELETE USING (auth.uid()::text = follower_id);

  CREATE POLICY "anon_read_notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id);
  CREATE POLICY "anon_update_own_notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id);

  -- ───────────────────────────────────────────────────────────────
  -- 3. UNIQUE CONSTRAINTS FOR DEDUP
  -- ───────────────────────────────────────────────────────────────

  CREATE UNIQUE INDEX IF NOT EXISTS idx_airdrop_claims_dedup
    ON airdrop_claims (airdrop_link_id, user_id);

  CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_metrics_dedup
    ON ad_metrics (campaign_id, user_id, type);

  -- ───────────────────────────────────────────────────────────────
  -- 4. credit_balance RPC — used by sell endpoints to credit WLD
  -- ───────────────────────────────────────────────────────────────

  CREATE OR REPLACE FUNCTION credit_balance(
    p_user_id TEXT,
    p_amount NUMERIC
  ) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $func$
  BEGIN
    INSERT INTO user_balances (user_id, balance, updated_at)
    VALUES (p_user_id, p_amount, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      balance = user_balances.balance + p_amount,
      updated_at = NOW();
  END;
  $func$;

  -- Also ensure deduct_balance checks for sufficient funds
  CREATE OR REPLACE FUNCTION deduct_balance(
    p_user_id TEXT,
    p_amount NUMERIC
  ) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $func$
  DECLARE
    v_current NUMERIC;
  BEGIN
    SELECT available INTO v_current FROM balances WHERE user_id = p_user_id FOR UPDATE;
    IF v_current IS NULL OR v_current < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance: have %, need %', COALESCE(v_current, 0), p_amount;
    END IF;
    UPDATE balances SET available = available - p_amount WHERE user_id = p_user_id;
  END;
  $func$;

  -- ───────────────────────────────────────────────────────────────
  -- 5. add_holding RPC — atomic holding increment
  -- ───────────────────────────────────────────────────────────────

  CREATE OR REPLACE FUNCTION add_holding(
    p_user_id TEXT,
    p_token_id TEXT,
    p_amount NUMERIC
  ) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $func$
  BEGIN
    INSERT INTO holdings (user_id, token_id, amount, updated_at)
    VALUES (p_user_id, p_token_id, p_amount, NOW())
    ON CONFLICT (user_id, token_id)
    DO UPDATE SET
      amount = holdings.amount + p_amount,
      updated_at = NOW();
  END;
  $func$;
  
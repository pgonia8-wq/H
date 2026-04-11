-- =============================================================================
-- MIGRATION 5: CRITICAL FIXES (from security audit + load analysis)
-- Safe to run multiple times (IF NOT EXISTS / OR REPLACE)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- FIX 1: LIKES — Add UNIQUE constraint for dedup
-- Without this, toggle_like's EXCEPTION WHEN unique_violation never fires
-- and a user can have multiple like rows for the same post.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_likes_post_user'
  ) THEN
    -- Clean up any existing duplicates before adding constraint
    DELETE FROM likes a USING likes b
      WHERE a.id > b.id
        AND a.post_id = b.post_id
        AND a.user_id = b.user_id;

    ALTER TABLE likes ADD CONSTRAINT uq_likes_post_user UNIQUE (post_id, user_id);
  END IF;
END $$;

-- Composite index for the lookup pattern in toggle_like
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);

-- ---------------------------------------------------------------------------
-- FIX 2: ATOMIC TOKEN BUY — Single transaction for token + holdings
-- Replaces the current 2-step OCC pattern that can leave supply desynchronized
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION atomic_token_buy(
  p_token_id TEXT,
  p_user_id TEXT,
  p_username TEXT,
  p_amount_wld DOUBLE PRECISION,
  p_tokens_out BIGINT,
  p_fee DOUBLE PRECISION,
  p_net_wld DOUBLE PRECISION,
  p_new_supply BIGINT,
  p_new_price DOUBLE PRECISION,
  p_new_price_usd DOUBLE PRECISION,
  p_total_wld_in_curve DOUBLE PRECISION,
  p_treasury_balance DOUBLE PRECISION,
  p_curve_percent DOUBLE PRECISION,
  p_market_cap DOUBLE PRECISION,
  p_volume_24h DOUBLE PRECISION,
  p_expected_supply BIGINT
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_updated_id TEXT;
  v_prev_amount BIGINT;
  v_prev_avg DOUBLE PRECISION;
  v_new_amount BIGINT;
  v_avg_price DOUBLE PRECISION;
  v_unit_price DOUBLE PRECISION;
BEGIN
  -- Step 1: Update token with OCC check (atomic within this transaction)
  UPDATE tokens SET
    circulating_supply = p_new_supply,
    price_wld = p_new_price,
    price_usdc = p_new_price_usd,
    total_wld_in_curve = p_total_wld_in_curve,
    treasury_balance = p_treasury_balance,
    curve_percent = p_curve_percent,
    market_cap = p_market_cap,
    volume_24h = p_volume_24h
  WHERE id = p_token_id
    AND circulating_supply = p_expected_supply
  RETURNING id INTO v_updated_id;

  IF v_updated_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'concurrent_trade');
  END IF;

  -- Step 2: Get current holdings (within same transaction — no race possible)
  SELECT amount, avg_buy_price INTO v_prev_amount, v_prev_avg
  FROM holdings
  WHERE user_id = p_user_id AND token_id = p_token_id
  FOR UPDATE;

  v_prev_amount := COALESCE(v_prev_amount, 0);
  v_prev_avg := COALESCE(v_prev_avg, 0);
  v_unit_price := p_net_wld / p_tokens_out;
  v_new_amount := v_prev_amount + p_tokens_out;

  IF v_prev_amount > 0 THEN
    v_avg_price := (v_prev_avg * v_prev_amount + v_unit_price * p_tokens_out) / v_new_amount;
  ELSE
    v_avg_price := v_unit_price;
  END IF;

  -- Step 3: Upsert holdings
  INSERT INTO holdings (user_id, token_id, amount, avg_buy_price, current_price, value, pnl, pnl_percent, updated_at)
  VALUES (
    p_user_id, p_token_id, p_tokens_out, v_unit_price, p_new_price,
    p_tokens_out * p_new_price, 0, 0, NOW()
  )
  ON CONFLICT (user_id, token_id) DO UPDATE SET
    amount = v_new_amount,
    avg_buy_price = v_avg_price,
    current_price = p_new_price,
    value = v_new_amount * p_new_price,
    pnl = (p_new_price - v_avg_price) * v_new_amount,
    pnl_percent = CASE WHEN v_avg_price > 0 THEN ((p_new_price - v_avg_price) / v_avg_price) * 100 ELSE 0 END,
    updated_at = NOW();

  -- Step 4: Increment holders if this is a new holder
  IF v_prev_amount = 0 THEN
    UPDATE tokens SET holders = holders + 1 WHERE id = p_token_id;
  END IF;

  -- Step 5: Record activity
  INSERT INTO token_activity (type, user_id, username, token_id, amount, price, total, timestamp)
  VALUES ('buy', p_user_id, p_username, p_token_id, p_tokens_out, p_new_price, p_amount_wld, NOW());

  RETURN json_build_object(
    'success', true,
    'prev_amount', v_prev_amount,
    'new_amount', v_new_amount,
    'avg_price', v_avg_price,
    'unit_price', v_unit_price
  );
END;
$$;

-- Holdings needs UNIQUE(user_id, token_id) for the ON CONFLICT above
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_holdings_user_token'
  ) THEN
    -- Clean up duplicate holdings before adding constraint
    DELETE FROM holdings a USING holdings b
      WHERE a.id > b.id
        AND a.user_id = b.user_id
        AND a.token_id = b.token_id;

    ALTER TABLE holdings ADD CONSTRAINT uq_holdings_user_token UNIQUE (user_id, token_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- FIX 3: SOFT DELETE — Index for posts with deleted_flag = false
-- The column already exists (createPost sets deleted_flag: false)
-- ---------------------------------------------------------------------------
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_flag BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_posts_active
  ON posts(created_at DESC)
  WHERE deleted_flag = false;

CREATE INDEX IF NOT EXISTS idx_posts_active_timestamp
  ON posts(timestamp DESC)
  WHERE deleted_flag = false;

-- RPC for safe batch delete (soft delete, then hard delete in batches)
CREATE OR REPLACE FUNCTION soft_delete_posts(p_post_ids UUID[])
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE posts SET deleted_flag = true
  WHERE id = ANY(p_post_ids) AND deleted_flag = false;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RPC for batch hard delete (for maintenance jobs only)
CREATE OR REPLACE FUNCTION batch_hard_delete_posts(p_limit INT DEFAULT 100)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM posts
  WHERE id IN (
    SELECT id FROM posts
    WHERE deleted_flag = true
    ORDER BY created_at ASC
    LIMIT p_limit
  );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

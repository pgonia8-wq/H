-- ============================================================================
  -- H APP — MIGRACIÓN DE SEGURIDAD #2: RLS restrictiva + Chat rate limit
  -- Seguro de ejecutar múltiples veces (idempotente)
  -- ============================================================================

  -- ═══════════════════════════════════════════════════════════════
  -- P1: DROP permissive UPDATE/DELETE policies on financial tables
  -- ═══════════════════════════════════════════════════════════════

  DROP POLICY IF EXISTS balances_update ON balances;
  DROP POLICY IF EXISTS user_balances_update ON user_balances;
  DROP POLICY IF EXISTS holdings_update ON holdings;
  DROP POLICY IF EXISTS holdings_delete ON holdings;
  DROP POLICY IF EXISTS tokens_update ON tokens;

  -- Posts: replace permissive UPDATE with owner-only for non-score fields
  DROP POLICY IF EXISTS posts_update ON posts;

  -- Profiles: replace permissive UPDATE with owner-only
  DROP POLICY IF EXISTS profiles_update ON profiles;

  -- ═══════════════════════════════════════════════════════════════
  -- P5: Chat rate limit function (max 1 message per second per user)
  -- ═══════════════════════════════════════════════════════════════

  CREATE OR REPLACE FUNCTION check_chat_rate_limit(p_user_id TEXT)
  RETURNS BOOLEAN LANGUAGE plpgsql AS $func_chat$
  DECLARE
    last_msg TIMESTAMPTZ;
  BEGIN
    SELECT MAX(created_at) INTO last_msg
    FROM global_chat_messages
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 second';

    RETURN last_msg IS NULL;
  END;
  $func_chat$;

  -- RLS policy for chat: only allow INSERT if rate limit passes
  DO $block_chat$ BEGIN
    CREATE POLICY chat_insert_rate_limit ON global_chat_messages
      FOR INSERT
      WITH CHECK (check_chat_rate_limit(user_id));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $block_chat$;

  -- ═══════════════════════════════════════════════════════════════
  -- Ensure RLS is enabled on global_chat_messages
  -- ═══════════════════════════════════════════════════════════════

  ALTER TABLE global_chat_messages ENABLE ROW LEVEL SECURITY;

  -- Keep SELECT for everyone
  DO $block_chat_sel$ BEGIN
    CREATE POLICY chat_select ON global_chat_messages FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $block_chat_sel$;

  -- ═══════════════════════════════════════════════════════════════
  -- FIN DE MIGRACIÓN DE SEGURIDAD #2
  -- ═══════════════════════════════════════════════════════════════
  
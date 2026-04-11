
  -- P10: Audit log table for financial operations
  CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Index for fast lookups
  CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_log_type ON audit_log(event_type);
  CREATE INDEX IF NOT EXISTS idx_audit_log_time ON audit_log(created_at DESC);

  -- RLS: nobody can modify audit logs from client
  ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

  -- Only service_role can insert (server-side)
  DROP POLICY IF EXISTS audit_log_no_anon ON audit_log;
  CREATE POLICY audit_log_no_anon ON audit_log FOR ALL USING (false);

  -- Audit function for server-side use
  CREATE OR REPLACE FUNCTION log_audit(
    p_event TEXT,
    p_user TEXT,
    p_details JSONB DEFAULT '{}',
    p_ip TEXT DEFAULT NULL
  ) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $func_audit$
  BEGIN
    INSERT INTO audit_log (event_type, user_id, details, ip_address)
    VALUES (p_event, p_user, p_details, p_ip);
  END;
  $func_audit$;
  
  -- P7 RPC functions for atomic likes/tips/reposts
  
  CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID, p_user_id TEXT)
  RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $func_like$
  DECLARE
    v_existing_id UUID;
    v_new_likes INT;
  BEGIN
    SELECT id INTO v_existing_id FROM likes 
      WHERE post_id = p_post_id AND user_id = p_user_id LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      DELETE FROM likes WHERE id = v_existing_id;
      UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = p_post_id
        RETURNING likes INTO v_new_likes;
      RETURN json_build_object('liked', false, 'likes', v_new_likes);
    ELSE
      INSERT INTO likes (post_id, user_id) VALUES (p_post_id, p_user_id);
      UPDATE posts SET likes = likes + 1 WHERE id = p_post_id
        RETURNING likes INTO v_new_likes;
      RETURN json_build_object('liked', true, 'likes', v_new_likes);
    END IF;
  EXCEPTION WHEN unique_violation THEN
    SELECT likes INTO v_new_likes FROM posts WHERE id = p_post_id;
    RETURN json_build_object('liked', true, 'likes', v_new_likes);
  END;
  $func_like$;
  

  CREATE OR REPLACE FUNCTION add_tip(p_post_id UUID, p_from_user TEXT, p_amount NUMERIC)
  RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $func_tip$
  DECLARE
    v_post_owner TEXT;
    v_new_total NUMERIC;
  BEGIN
    IF p_amount <= 0 OR p_amount > 100 THEN
      RETURN json_build_object('error', 'Invalid tip amount');
    END IF;

    SELECT user_id INTO v_post_owner FROM posts WHERE id = p_post_id;
    IF v_post_owner IS NULL THEN
      RETURN json_build_object('error', 'Post not found');
    END IF;

    IF v_post_owner = p_from_user THEN
      RETURN json_build_object('error', 'Cannot tip own post');
    END IF;

    INSERT INTO tips (from_user_id, to_post_id, amount) 
      VALUES (p_from_user, p_post_id, p_amount);

    UPDATE posts SET tips_total = COALESCE(tips_total, 0) + p_amount 
      WHERE id = p_post_id
      RETURNING tips_total INTO v_new_total;

    RETURN json_build_object('success', true, 'tips_total', v_new_total);
  END;
  $func_tip$;
  
  CREATE OR REPLACE FUNCTION do_repost(p_post_id UUID, p_user_id TEXT, p_content TEXT DEFAULT NULL)
  RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $func_repost$
  DECLARE
    v_original RECORD;
    v_new_reposts INT;
  BEGIN
    SELECT * INTO v_original FROM posts WHERE id = p_post_id;
    IF v_original IS NULL THEN
      RETURN json_build_object('error', 'Post not found');
    END IF;

    INSERT INTO posts (user_id, content, repost_of, created_at)
      VALUES (p_user_id, COALESCE(p_content, v_original.content), p_post_id, NOW());

    UPDATE posts SET reposts = COALESCE(reposts, 0) + 1 WHERE id = p_post_id
      RETURNING reposts INTO v_new_reposts;

    RETURN json_build_object('success', true, 'reposts', v_new_reposts);
  END;
  $func_repost$;
  
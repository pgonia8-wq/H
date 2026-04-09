-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN: update_post_scores()
-- Destino: Supabase → SQL Editor
--
-- api/updateScores.mjs la llama cada 15 minutos desde el CRON de Vercel:
--   supabase.rpc("update_post_scores")
--
-- Si esta función no existe en tu base de datos, el CRON falla con:
--   "function update_post_scores() does not exist"
--
-- La función recalcula el score de cada post basándose en:
--   - Likes (peso alto)
--   - Views (peso medio)
--   - Comments (peso medio)
--   - Tiempo transcurrido (decay exponencial para favorecer contenido reciente)
--
-- Columnas reales de la tabla posts: likes, views, comments
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_post_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET score = (
    (COALESCE(likes, 0)    * 3.0) +
    (COALESCE(views, 0)    * 0.5) +
    (COALESCE(comments, 0) * 2.0)
  )
  * EXP(
    -EXTRACT(EPOCH FROM (NOW() - created_at)) / (48.0 * 3600)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_post_scores() TO service_role;

import { createClient } from "@supabase/supabase-js";

  let _supabase = null;
  function getSupabase() {
    if (!_supabase) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) throw new Error("SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas");
      _supabase = createClient(url, key);
    }
    return _supabase;
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  function sanitizeContent(text) {
    return String(text)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/<(?!\/?(b|i|u|em|strong|br|p)\b)[^>]+>/gi, "")
      .trim();
  }

  export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const t0 = Date.now();
    const reqId = Math.random().toString(36).slice(2, 10);

    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error(JSON.stringify({ event: "missing_env", endpoint: "/api/createComment" }));
        return res.status(500).json({ error: "Configuración del servidor incompleta" });
      }

      const body = req.body ?? {};
      const post_id = body.post_id || body.postId;
      const user_id = body.user_id || body.userId;
      const rawContent = body.content;

      if (!post_id || typeof post_id !== "string" || !UUID_RE.test(post_id))   return res.status(400).json({ error: "post_id requerido (uuid)" });
      if (!user_id || typeof user_id !== "string" || user_id.length > 64)      return res.status(400).json({ error: "user_id requerido" });
      if (!rawContent || typeof rawContent !== "string" || !rawContent.trim()) return res.status(400).json({ error: "content requerido" });
      if (rawContent.length > 2000)                                            return res.status(400).json({ error: "content demasiado largo (max 2000)" });

      const content = sanitizeContent(rawContent);
      if (!content) return res.status(400).json({ error: "content vacío tras sanitización" });

      const supabase = getSupabase();

      const { data: profile, error: profileErr } = await supabase
        .from("profiles").select("id").eq("id", user_id).maybeSingle();
      if (profileErr) return res.status(500).json({ error: profileErr.message });
      if (!profile)   return res.status(403).json({ error: "Usuario no registrado" });

      const { data: post, error: postErr } = await supabase
        .from("posts").select("id, deleted_flag, comments").eq("id", post_id).maybeSingle();
      if (postErr) return res.status(500).json({ error: postErr.message });
      if (!post || post.deleted_flag) return res.status(404).json({ error: "Post no encontrado" });

      const now = new Date().toISOString();

      const { data: newComment, error: insertErr } = await supabase
        .from("comments")
        .insert({ post_id, user_id, content, created_at: now })
        .select("id, post_id, user_id, content, created_at")
        .single();

      if (insertErr) {
        console.error(JSON.stringify({ event: "error", type: "insert_comment", reqId, error: insertErr.message, latency_ms: Date.now() - t0 }));
        return res.status(500).json({ error: insertErr.message });
      }

      await supabase.from("posts").update({ comments: (post.comments || 0) + 1 }).eq("id", post_id);

      const { data: authorProfile } = await supabase
        .from("profiles").select("username, avatar_url").eq("id", user_id).maybeSingle();

      console.log(JSON.stringify({ event: "create_comment_ok", reqId, userId: user_id, postId: post_id, commentId: newComment.id, latency_ms: Date.now() - t0 }));
      return res.status(201).json({ success: true, comment: { ...newComment, profiles: authorProfile || null } });
    } catch (err) {
      console.error(JSON.stringify({ event: "fatal_error", endpoint: "/api/createComment", reqId, error: err?.message || String(err), latency_ms: Date.now() - t0 }));
      if (!res.headersSent) return res.status(500).json({ error: "Error interno: " + (err?.message || "desconocido") });
    }
  }
  
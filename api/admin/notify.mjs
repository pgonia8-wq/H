import { supabase, adminAuth, cors, writeLog } from "./_auth.mjs";

export default async function handler(req, res) {
  cors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!adminAuth(req, res)) return;

  const { userId, action, message, reason } = req.body || {};
  if (!userId || !action || !message) {
    return res.status(400).json({ error: "Missing userId, action, or message" });
  }
  if (!["warn", "suspend", "ban"].includes(action)) {
    return res.status(400).json({ error: "action must be warn, suspend, or ban" });
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();
    const username = profile?.username || userId.slice(0, 12);

    if (action === "warn") {
      await supabase.from("user_notifications").insert({
        user_id: userId,
        type: "warning",
        title: "Aviso del equipo de Humans",
        message,
        admin_reason: reason || null,
        severity: "warning",
      });

      await writeLog({
        category: "admin_action",
        event: "user_warned",
        severity: "warning",
        user_id: userId,
        username,
        details: { action: "warn", message, reason },
        endpoint: "/api/admin/notify",
      });

      return res.status(200).json({ success: true, result: "warning_sent" });
    }

    if (action === "suspend") {
      const until = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      await supabase.from("profiles").update({
        banned: true,
        ban_reason: `Suspendido 48h: ${reason || message}`.slice(0, 200),
        banned_at: new Date().toISOString(),
      }).eq("id", userId);

      await supabase.from("user_notifications").insert({
        user_id: userId,
        type: "suspension",
        title: "Cuenta suspendida temporalmente",
        message,
        admin_reason: reason || null,
        severity: "danger",
        suspension_until: until,
      });

      await writeLog({
        category: "admin_action",
        event: "user_suspended_48h",
        severity: "warning",
        user_id: userId,
        username,
        details: { action: "suspend", message, reason, until },
        endpoint: "/api/admin/notify",
      });

      return res.status(200).json({ success: true, result: "suspended_48h", until });
    }

    if (action === "ban") {
      await supabase.from("profiles").update({
        banned: true,
        ban_reason: `Bloqueado: ${reason || message}`.slice(0, 200),
        banned_at: new Date().toISOString(),
      }).eq("id", userId);

      await supabase.from("user_notifications").insert({
        user_id: userId,
        type: "ban",
        title: "Cuenta bloqueada",
        message,
        admin_reason: reason || null,
        severity: "critical",
      });

      await writeLog({
        category: "admin_action",
        event: "user_blocked",
        severity: "error",
        user_id: userId,
        username,
        details: { action: "ban", message, reason },
        endpoint: "/api/admin/notify",
      });

      return res.status(200).json({ success: true, result: "blocked" });
    }
  } catch (err) {
    console.error("[ADMIN/NOTIFY]", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}

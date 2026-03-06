export default async function handler(req, res) {
  console.log("[BACKEND] Request recibido - Method:", req.method);
  console.log("[BACKEND] Body recibido:", JSON.stringify(req.body, null, 2));

  if (req.method !== "POST") {
    console.log("[BACKEND] Método no permitido:", req.method);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const { action, max_age, userId } = body;  // ← agregamos userId aquí

  if (!action) {
    console.log("[BACKEND] Falta action");
    return res.status(400).json({
      success: false,
      error: "Missing action",
    });
  }

  // En modo managed de MiniKit dentro de World App, el proof ya se validó internamente en World App
  // No necesitas llamar a ningún endpoint de Worldcoin aquí
  // Solo confirma que la action es válida y responde success

  console.log("[BACKEND] Acción recibida y validada:", action);
  console.log("[BACKEND] Verificación managed exitosa (MiniKit ya lo hizo)");

  // ── Guardar verified: true en Supabase ──
if (userId) {
  // 1️⃣ Crear o actualizar el perfil si no existía
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: ["id"] });

  if (upsertError) {
    console.error("[BACKEND] Error al registrar usuario:", upsertError.message);
  } else {
    console.log("[BACKEND] Usuario registrado/actualizado correctamente:", userId);

    // 2️⃣ Guardar verified: true SOLO si el perfil se creó o existía
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ verified: true })
      .eq("id", userId);

    if (updateError) {
      console.error("[BACKEND] Error al guardar verified:", updateError.message);
    } else {
      console.log("[BACKEND] verified: true guardado correctamente para userId:", userId);
    }
  }
} else {
  console.warn("[BACKEND] No se recibió userId en el body → no se pudo guardar verified");
      }

  return res.status(200).json({ success: true });
}

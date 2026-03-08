import { supabase } from "../supabaseClient.js";

export default async function handler(req, res) {
  console.log("[BACKEND] Request recibido - Method:", req.method);
  console.log("[BACKEND] Body recibido:", JSON.stringify(req.body, null, 2));

  if (req.method !== "POST") {
    console.log("[BACKEND] Método no permitido:", req.method);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const userId = body.nullifier_hash || body.payload?.nullifier_hash;
  console.log("[BACKEND] userId extraído:", userId);

  if (!userId) {
    console.warn("[BACKEND] No se recibió userId");
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  console.log("[BACKEND] Llamando a World API v2 verify...");

  const verifyResponse = await fetch(
    "https://developer.worldcoin.org/api/v2/verify/app_6a98c88249208506dcd4e04b529111fc",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merkle_root: body.merkle_root,
        nullifier_hash: userId,
        proof: body.proof,
        verification_level: body.verification_level,
        action: body.action,
      }),
    }
  );

  const verifyData = await verifyResponse.json();
  console.log("[BACKEND] Resultado verificación World:", verifyData);

  if (!verifyData.success) {
    console.log("[BACKEND] World rechazó la prueba");
    return res.status(400).json({ success: false, error: "World verification failed" });
  }

  console.log("[BACKEND] Guardando verified en Supabase:", userId);

  // Crear o actualizar perfil
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: ["id"] });

  if (upsertError) console.error("[BACKEND] Error upsert:", upsertError.message);

  // Guardar verified: true
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ verified: true })
    .eq("id", userId);

  if (updateError) console.error("[BACKEND] Error update verified:", updateError.message);

  console.log("[BACKEND] verified guardado correctamente para userId:", userId);

  return res.status(200).json({ success: true, userId });
        }

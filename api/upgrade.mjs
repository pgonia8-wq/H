// Error #1 corregido: este endpoint faltaba completamente.
// Verifica el pago con Worldcoin antes de actualizar el tier del usuario.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";
const VALID_TIERS = ["premium", "premium+"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { userId, tier, transactionId } = req.body || {};

  if (!userId || !tier || !transactionId) {
    return res.status(400).json({ success: false, error: "userId, tier y transactionId son requeridos" });
  }

  if (!VALID_TIERS.includes(tier)) {
    return res.status(400).json({ success: false, error: "Tier inválido. Debe ser 'premium' o 'premium+'" });
  }

  console.log("[UPGRADE] Verificando transacción con Worldcoin:", transactionId);

  // Paso 1: Verificar que la transacción existe y está confirmada con Worldcoin
  try {
    const verifyRes = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${APP_ID}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.error("[UPGRADE] Error al consultar transacción:", errText);
      return res.status(400).json({ success: false, error: "No se pudo verificar la transacción con Worldcoin" });
    }

    const txData = await verifyRes.json();
    console.log("[UPGRADE] Datos de transacción:", txData);

    if (txData.transaction_status !== "mined") {
      console.warn("[UPGRADE] Transacción no minada. Status:", txData.transaction_status);
      return res.status(402).json({
        success: false,
        error: `Transacción no confirmada aún (estado: ${txData.transaction_status}). Intenta en unos segundos.`,
      });
    }

    // Verificar que el destinatario es nuestro receiver address
    const RECEIVER = "0xdf4a991bc05945bd0212e773adcff6ea619f4c4b";
    if (txData.to?.toLowerCase() !== RECEIVER.toLowerCase()) {
      console.error("[UPGRADE] Destinatario de transacción no coincide:", txData.to);
      return res.status(400).json({ success: false, error: "La transacción no corresponde a este servicio" });
    }
  } catch (err) {
    console.error("[UPGRADE] Error verificando transacción:", err);
    return res.status(500).json({ success: false, error: "Error al contactar Worldcoin" });
  }

  // Paso 2: Actualizar el tier en Supabase y registrar el upgrade
  try {
    // Verificar que el usuario existe
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, tier")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    // Actualizar tier
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ tier, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Registrar en tabla upgrades para llevar control
    const { error: upgradeError } = await supabase
      .from("upgrades")
      .insert({
        user_id: userId,
        tier,
        transaction_id: transactionId,
        upgraded_at: new Date().toISOString(),
      });

    if (upgradeError) {
      // No falla si la inserción en upgrades falla (puede ser por duplicado)
      console.warn("[UPGRADE] Warning al registrar upgrade (puede ser duplicado):", upgradeError.message);
    }

    console.log("[UPGRADE] Upgrade exitoso para userId:", userId, "→ tier:", tier);
    return res.status(200).json({ success: true, tier });
  } catch (err) {
    console.error("[UPGRADE] Error en Supabase:", err);
    return res.status(500).json({ success: false, error: err.message || "Error al procesar upgrade" });
  }
}

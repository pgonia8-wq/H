import { createClient } from "@supabase/supabase-js";

  if (!process.env.SUPABASE_URL) {
    console.error("[WITHDRAW] ERROR: SUPABASE_URL no configurada");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[WITHDRAW] ERROR: SUPABASE_SERVICE_ROLE_KEY no configurada");
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const body = req.body || {};
    const { userId, amount, wallet } = body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ success: false, error: "userId es requerido" });
    }
    if (!wallet || typeof wallet !== "string") {
      return res.status(400).json({ success: false, error: "wallet es requerida" });
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ success: false, error: "Monto inválido" });
    }

    try {
      const { data: balanceData, error: balanceError } = await supabase
        .from("balances")
        .select("available")
        .eq("user_id", userId)
        .single();

      if (balanceError || !balanceData) {
        console.error("[WITHDRAW] Balance check error:", balanceError?.message);
        return res.status(400).json({ success: false, error: "No se pudo verificar el saldo" });
      }

      if (balanceData.available < amount) {
        return res.status(400).json({ success: false, error: "Fondos insuficientes" });
      }

      const { error: insertError } = await supabase.from("withdrawals").insert({
        user_id: userId,
        amount,
        wallet_address: wallet,
        status: "pending",
      });

      if (insertError) {
        console.error("[WITHDRAW] Insert error:", insertError.message);
        return res.status(500).json({ success: false, error: "Error al crear retiro" });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[WITHDRAW] Error:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
  
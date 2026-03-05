import { supabase } from "../supabaseClient.mjs";
import { nanoid } from "nanoid";

const PREMIUM_LIMIT = 10000;
const PREMIUM_PLUS_LIMIT = 3000;

// Obtiene precio dinámico según cantidad de usuarios
async function getUpgradePrice(tier) {
  if (tier === "premium") {
    const { count } = await supabase
      .from("upgrades")
      .select("*", { count: "exact" })
      .eq("tier", "premium");
    return count < PREMIUM_LIMIT ? 10 : 20;
  } else {
    const { count } = await supabase
      .from("upgrades")
      .select("*", { count: "exact" })
      .eq("tier", "premium+");
    return count < PREMIUM_PLUS_LIMIT ? 15 : 35;
  }
}

// Crea token de referido único
async function createReferralToken(userId) {
  const token = nanoid(10);
  const { error } = await supabase.from("referral_tokens").insert({
    token,
    created_by: userId,
    tier: "premium",
    boost_limit: 1,
    tips_allowed: false,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
  return token;
}

// Handler principal compatible con World App
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    // Parsear body de forma compatible
    let body = "";
    for await (const chunk of req) body += chunk;
    const data = JSON.parse(body || "{}");

    const { userId, tier, transactionId, referralToken } = data;

    if (!userId || !tier || !transactionId) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Faltan parámetros obligatorios" }));
      return;
    }

    // Aquí puedes integrar verificación real con Worldcoin
    const paymentValid = true; // placeholder
    if (!paymentValid) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Transacción inválida" }));
      return;
    }

    const price = await getUpgradePrice(tier);

    // Inserta upgrade
    const { error: insertError } = await supabase.from("upgrades").insert({
      user_id: userId,
      tier,
      price,
      start_date: new Date().toISOString(),
      transaction_id: transactionId,
    });

    if (insertError) throw insertError;

    // Si viene token de referido, aplica boost
    if (referralToken) {
      const { data: tokenData } = await supabase
        .from("referral_tokens")
        .select("*")
        .eq("token", referralToken)
        .single();

      if (tokenData) {
        await supabase.from("upgrades").insert({
          user_id: userId,
          tier: tokenData.tier,
          price: 0,
          start_date: new Date().toISOString(),
          transaction_id: `referral-${nanoid(6)}`,
          boost_limit: tokenData.boost_limit,
          tips_allowed: tokenData.tips_allowed,
        });

        await supabase
          .from("referral_tokens")
          .update({ used_by: userId, used_at: new Date().toISOString() })
          .eq("token", referralToken);
      }
    }

    const newReferralToken = await createReferralToken(userId);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: true,
        price,
        referralToken: newReferralToken,
      })
    );
  } catch (err) {
    console.error("Upgrade API ERROR:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

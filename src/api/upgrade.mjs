import { supabase } from "../supabaseClient.mjs";
import { nanoid } from "nanoid";

const PREMIUM_LIMIT = 10000;
const PREMIUM_PLUS_LIMIT = 3000;

// Obtiene precio dinámico
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

// Crea token de referido
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

// Handler principal
export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("[BACKEND] Método no permitido:", req.method);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const { userId, tier, transactionId, referralToken } = body;

  if (!userId || !tier || !transactionId) {
    console.log("[BACKEND] Faltan datos en body");
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const price = await getUpgradePrice(tier);

    // Insert upgrade
    const { error: insertError } = await supabase.from("upgrades").insert({
      user_id: userId,
      tier,
      price,
      start_date: new Date().toISOString(),
      transaction_id: transactionId,
    });

    if (insertError) throw insertError;

    // Update profiles.tier
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ tier })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Si referralToken, aplica
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

    return res.status(200).json({ success: true, price, referralToken: newReferralToken });
  } catch (err) {
    console.error("[BACKEND] Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

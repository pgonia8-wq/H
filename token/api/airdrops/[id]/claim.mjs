import { supabase, cors } from "../../_supabase.mjs";
  import { requireOrb } from "../../_orbGuard.mjs";

  export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { id } = req.query;
    const { userId } = req.body ?? {};

    if (!id || !userId) {
      return res.status(400).json({ error: "Missing required fields: id (airdrop), userId" });
    }

    const orbOk = await requireOrb(userId, res);
    if (!orbOk) return;

    try {
      const { data: airdrop, error: airdropErr } = await supabase
        .from("airdrops")
        .select("*")
        .eq("id", id)
        .single();

      if (airdropErr || !airdrop) return res.status(404).json({ error: "Airdrop not found" });
      if (!airdrop.is_active) return res.status(400).json({ error: "Este airdrop ya no está activo" });

      const remainingAmount = Number(airdrop.total_amount) - Number(airdrop.claimed_amount);
      if (remainingAmount <= 0) {
        return res.status(400).json({ error: "Este airdrop ya está agotado" });
      }

      const { data: lastClaim } = await supabase
        .from("airdrop_claims")
        .select("claimed_at")
        .eq("airdrop_id", id)
        .eq("user_id", userId)
        .order("claimed_at", { ascending: false })
        .limit(1)
        .single();

      if (lastClaim) {
        const cooldownMs = Number(airdrop.cooldown_hours) * 60 * 60 * 1000;
        const nextClaim = new Date(lastClaim.claimed_at).getTime() + cooldownMs;
        if (Date.now() < nextClaim) {
          const nextClaimAt = new Date(nextClaim).toISOString();
          return res.status(400).json({
            error: "Aún no puedes reclamar este airdrop",
            nextClaimAt,
          });
        }
      }

      const claimAmount = Math.min(Number(airdrop.daily_amount), remainingAmount);

      await supabase.from("airdrop_claims").insert({
        airdrop_id: id,
        user_id: userId,
        amount: claimAmount,
        claimed_at: new Date().toISOString(),
      });

      const { data: updatedAirdrop } = await supabase.from("airdrops")
        .update({
          claimed_amount: Number(airdrop.claimed_amount) + claimAmount,
          participants: Number(airdrop.participants) + (lastClaim ? 0 : 1),
          is_active: (Number(airdrop.claimed_amount) + claimAmount) < Number(airdrop.total_amount)
            && (!airdrop.end_date || new Date(airdrop.end_date) > new Date()),
        })
        .eq("id", id)
        .eq("claimed_amount", airdrop.claimed_amount)
        .select("id")
        .maybeSingle();

      if (!updatedAirdrop) {
        console.warn("[AIRDROP_CLAIM] OCC conflict on airdrop update");
      }

      const { data: existing } = await supabase
        .from("holdings")
        .select("amount, avg_buy_price")
        .eq("user_id", userId)
        .eq("token_id", airdrop.token_id)
        .maybeSingle();

      const prevAmount = Number(existing?.amount ?? 0);
      const newAmount = prevAmount + claimAmount;

      if (existing) {
        await supabase.from("holdings")
          .update({
            amount: newAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("token_id", airdrop.token_id)
          .eq("amount", prevAmount);
      } else {
        await supabase.from("holdings").insert({
          user_id: userId,
          token_id: airdrop.token_id,
          token_name: airdrop.token_name,
          token_symbol: airdrop.token_symbol,
          token_emoji: airdrop.token_emoji,
          amount: claimAmount,
          avg_buy_price: 0,
          current_price: 0,
          value: 0,
          pnl: 0,
          pnl_percent: 0,
          updated_at: new Date().toISOString(),
        });
      }

      await supabase.from("token_activity").insert({
        type: "airdrop_claim",
        user_id: userId,
        username: "airdrop",
        token_id: airdrop.token_id,
        token_symbol: airdrop.token_symbol,
        amount: claimAmount,
        timestamp: new Date().toISOString(),
      });

      const cooldownMs = Number(airdrop.cooldown_hours) * 60 * 60 * 1000;
      const nextClaimAt = new Date(Date.now() + cooldownMs).toISOString();

      return res.status(200).json({
        success: true,
        amount: claimAmount,
        nextClaimAt,
        message: `Recibiste ${claimAmount} ${airdrop.token_symbol}`,
      });
    } catch (err) {
      console.error("[POST /api/airdrops/:id/claim]", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
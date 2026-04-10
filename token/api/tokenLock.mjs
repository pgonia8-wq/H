import { supabase, cors } from "./_supabase.mjs";
import { requireOrb } from "./_orbGuard.mjs";
import { spotPrice } from "./_curve.mjs";

export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const tokenId = req.query.id;
    const { amount, durationDays, userId } = req.body ?? {};

    if (!tokenId || !amount || !durationDays || !userId) {
      return res.status(400).json({ error: "Missing tokenId, amount, durationDays, userId" });
    }
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });
    if (durationDays < 1) return res.status(400).json({ error: "Min lock duration: 1 day" });

    const orbOk = await requireOrb(userId, res);
    if (!orbOk) return;

    try {
      const { data: token, error: tErr } = await supabase
        .from("tokens")
        .select("id, symbol, creator_id, circulating_supply, locked_supply, total_supply")
        .eq("id", tokenId)
        .single();

      if (tErr || !token) return res.status(404).json({ error: "Token not found" });
      if (token.creator_id !== userId) return res.status(403).json({ error: "Only the creator can lock tokens" });

      const { data: holding } = await supabase
        .from("holdings")
        .select("amount")
        .eq("user_id", userId)
        .eq("token_id", tokenId)
        .maybeSingle();
      const heldAmount = Number(holding?.amount ?? 0);
      if (heldAmount < amount) {
        return res.status(400).json({ error: `Insufficient holdings. You hold: ${heldAmount}` });
      }

      const available = Number(token.circulating_supply ?? 0);
      if (amount > available) {
        return res.status(400).json({ error: `Insufficient circulating supply. Available: ${available}` });
      }

      const newLocked = Number(token.locked_supply ?? 0) + amount;
      const newCirculating = available - amount;
      const unlockDate = new Date(Date.now() + durationDays * 86400000).toISOString();

      const { data: updated, error: uErr } = await supabase
        .from("tokens")
        .update({
          locked_supply: newLocked,
          circulating_supply: newCirculating,
          lock_duration_days: durationDays,
        })
        .eq("id", tokenId)
        .eq("circulating_supply", available)
        .select("id")
        .maybeSingle();

      if (uErr) throw uErr;
      if (!updated) {
        return res.status(409).json({ error: "Concurrent modification detected, please retry" });
      }

      const { data: hUpd } = await supabase.from("holdings")
          .update({ amount: heldAmount - amount, updated_at: new Date().toISOString() })
          .eq("user_id", userId).eq("token_id", tokenId)
          .eq("amount", heldAmount)
          .select("user_id").maybeSingle();
        if (!hUpd) {
          return res.status(409).json({ error: "Concurrent holdings update, please retry" });
        }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      await supabase.from("token_activity").insert({
        type: "lock",
        user_id: userId,
        username: profile?.username ?? "anon",
        token_id: tokenId,
        token_symbol: token.symbol,
        amount: amount,
        price: spotPrice(newCirculating),
        total: 0,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        locked: amount,
        totalLocked: newLocked,
        unlockDate,
        message: `Locked ${amount.toLocaleString()} ${token.symbol} for ${durationDays} days`,
      });
    } catch (err) {
      console.error("[POST /api/tokens/:id/lock]", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
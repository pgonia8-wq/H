import { supabase, cors } from "./_supabase.mjs";
  import { requireOrb } from "./_orbGuard.mjs";

  const AIRDROP_TOKENS = 2500000;
  const APP_URL = "https://h-token.vercel.app";

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method === "GET") {
      const { creator } = req.query;
      if (!creator) return res.status(400).json({ error: "creator param required" });

      try {
        const { data, error } = await supabase
          .from("airdrop_links")
          .select("*")
          .eq("creator_id", creator)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const links = (data ?? []).map((r) => ({
          id: r.id,
          tokenId: r.token_id,
          tokenSymbol: r.token_symbol,
          code: r.code,
          totalAmount: r.total_amount,
          claimedAmount: r.claimed_amount ?? 0,
          remaining: r.total_amount - (r.claimed_amount ?? 0),
          mode: r.mode,
          isActive: r.is_active,
          claims: r.claims ?? 0,
          createdAt: r.created_at,
          link: APP_URL + "/claim/" + r.code,
        }));

        return res.status(200).json({ links, total: links.length });
      } catch (err) {
        console.error("[GET /api/airdropLinks]", err.message);
        return res.status(500).json({ error: err.message });
      }
    }

    if (req.method === "POST") {
      const { tokenId, mode, creatorId, transactionId } = req.body ?? {};

      if (!tokenId || !mode || !creatorId || !transactionId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!["permanent", "one_time"].includes(mode)) {
        return res.status(400).json({ error: "Mode must be permanent or one_time" });
      }

      const orbOk = await requireOrb(creatorId, res);
      if (!orbOk) return;

      try {
        const { data: token, error: tErr } = await supabase
          .from("tokens")
          .select("id, symbol, name, emoji, creator_id")
          .eq("id", tokenId)
          .single();

        if (tErr || !token) return res.status(404).json({ error: "Token not found" });
        if (token.creator_id !== creatorId) {
          return res.status(403).json({ error: "Only the token creator can buy airdrops" });
        }

        const code = generateCode();

        const newLink = {
          id: "adl_" + Math.random().toString(36).slice(2, 10),
          token_id: tokenId,
          token_symbol: token.symbol,
          token_name: token.name,
          code,
          total_amount: AIRDROP_TOKENS,
          claimed_amount: 0,
          mode,
          is_active: true,
          claims: 0,
          creator_id: creatorId,
          transaction_id: transactionId,
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error: iErr } = await supabase
          .from("airdrop_links")
          .insert(newLink)
          .select()
          .single();

        if (iErr) throw iErr;

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", creatorId)
          .maybeSingle();

        await supabase.from("token_activity").insert({
          type: "airdrop_buy",
          user_id: creatorId,
          username: profile?.username ?? "anon",
          token_id: tokenId,
          token_symbol: token.symbol,
          amount: AIRDROP_TOKENS,
          price: 25,
          total: 25,
          timestamp: new Date().toISOString(),
        });

        const link = APP_URL + "/claim/" + code;

        return res.status(201).json({
          success: true,
          airdropId: inserted.id,
          code,
          link,
          totalAmount: AIRDROP_TOKENS,
          message: "Airdrop purchased: " + AIRDROP_TOKENS.toLocaleString() + " " + token.symbol,
        });
      } catch (err) {
        console.error("[POST /api/airdropLinks]", err.message);
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  }
  
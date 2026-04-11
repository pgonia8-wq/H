import { supabase, cors } from "../../_supabase.mjs";

  export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing token id" });

    try {
      const { data: token } = await supabase
        .from("tokens")
        .select("circulating_supply")
        .eq("id", id)
        .single();

      const totalSupply = token?.circulating_supply || 1;

      const { data: holdings, error } = await supabase
        .from("holdings")
        .select("user_id, amount, updated_at")
        .eq("token_id", id)
        .gt("amount", 0)
        .order("amount", { ascending: false })
        .limit(100);

      if (error) throw error;

      const userIds = (holdings || []).map(h => h.user_id);
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        if (profiles) {
          profiles.forEach(p => { profileMap[p.id] = p; });
        }
      }

      const result = (holdings || []).map(h => ({
        userId: h.user_id,
        username: profileMap[h.user_id]?.username || "anon",
        avatarUrl: profileMap[h.user_id]?.avatar_url || null,
        amount: Number(h.amount),
        percentage: totalSupply > 0 ? (Number(h.amount) / totalSupply) * 100 : 0,
      }));

      return res.status(200).json(result);
    } catch (err) {
      console.error("[GET /api/tokens/:id/holders]", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
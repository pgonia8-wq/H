import { supabase, cors, mapTokenRow } from "../../_supabase.mjs";

  export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing token id" });

    try {
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return res.status(404).json({ error: "Token not found" });
        throw error;
      }

      const token = mapTokenRow(data);

      const { data: activities } = await supabase
        .from("token_activity")
        .select("type, amount, total")
        .eq("token_id", id);

      const acts = activities || [];
      const buys = acts.filter(a => a.type === "buy");
      const sells = acts.filter(a => a.type === "sell");
      const makers = new Set(acts.map(a => a.user_id)).size || acts.length;

      const buyVolume = buys.reduce((s, a) => s + Number(a.total ?? 0), 0);
      const sellVolume = sells.reduce((s, a) => s + Number(a.total ?? 0), 0);
      const totalVolume = buyVolume + sellVolume;

      token.stats = {
        txns: acts.length,
        buys: buys.length,
        sells: sells.length,
        buyVolume,
        sellVolume,
        volume: totalVolume,
        makers,
        buyPercent: acts.length > 0 ? (buys.length / acts.length) * 100 : 50,
        sellPercent: acts.length > 0 ? (sells.length / acts.length) * 100 : 50,
      };

      return res.status(200).json(token);
    } catch (err) {
      console.error("[GET /api/tokens/:id]", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
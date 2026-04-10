import { cors } from "./_supabase.mjs";

  export default async function handler(req, res) {
    cors(res, req);
    if (req.method === "OPTIONS") return res.status(200).end();
    return res.status(403).json({
      error: "This endpoint is disabled. Use initiateBuy + confirmBuy flow.",
    });
  }
  
import { cors } from "./_supabase.mjs";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  return res.status(410).json({
    error: "Airdrop claiming has been removed. Use airdrop links for distribution.",
  });
}

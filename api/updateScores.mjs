// /api/updateScores.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Validación opcional si usas CRON_SECRET
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }

  try {
    // Llama a tu función PL/pgSQL que recalcula score
    await supabase.rpc("update_post_scores");
    res.status(200).json({ success: true, message: "Scores updated" });
  } catch (err) {
    console.error("Error updating scores:", err);
    res.status(500).json({ success: false, error: err.message });
  }
      }

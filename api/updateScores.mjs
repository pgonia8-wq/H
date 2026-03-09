import { supabase } from "../../supabaseClient.mjs"; // wrapper solo para ESM

export default async function handler(req, res) {
  try {
    // Llama a tu función PL/pgSQL que recalcula scores
    await supabase.rpc("update_post_scores"); 
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating scores:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

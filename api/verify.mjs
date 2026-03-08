import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log("[BACKEND] Verifying World ID…");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const { payload, action, walletAddress, minikitData } = body;

  if (!payload || !payload.nullifier_hash || !payload.proof || !payload.merkle_root) {
    console.error("[BACKEND] Missing proof fields:", body);
    return res.status(400).json({ success: false, error: "Missing proof fields" });
  }

  const userId = payload.nullifier_hash;
  console.log("[BACKEND] nullifier_hash:", userId);

  // — Call Worldcoin API V2 Verify
  try {
    const verifyResponse = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${process.env.WORLDCOIN_APP_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merkle_root: payload.merkle_root,
          nullifier_hash: payload.nullifier_hash,
          proof: payload.proof,
          verification_level: payload.verification_level,
          action,
        }),
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("[BACKEND] Worldcoin verify response:", verifyData);

    if (!verifyData.success) {
      console.error("[BACKEND] Worldcoin rejected the proof");
      return res.status(400).json({ success: false, error: "Worldcoin validation failed", verifyData });
    }

  } catch (err) {
    console.error("[BACKEND] Error calling Worldcoin verify:", err);
    return res.status(500).json({ success: false, error: "Worldcoin service error" });
  }

  // — Guardar en world_id_proofs
  try {
    const { data: worldProofData, error: worldProofError } = await supabase
      .from("world_id_proofs")
      .upsert({
        nullifier_hash: userId,
        proof: payload.proof,
        merkle_root: payload.merkle_root,
        verification_level: payload.verification_level,
        wallet_address: walletAddress || null,
        minikit_data: minikitData || null,
        backend_response: JSON.stringify(payload)
      })
      .select();

    if (worldProofError) {
      console.error("[BACKEND] Supabase world_id_proofs error:", worldProofError);
      return res.status(500).json({ success: false, error: worldProofError.message });
    }

  } catch (err) {
    console.error("[BACKEND] Error guardando en world_id_proofs:", err);
    return res.status(500).json({ success: false, error: err.message });
  }

  // — Guardar o actualizar en profiles
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: userId, verified: true, tier: "free" }, { onConflict: ["id"] })
      .select();

    if (profileError) {
      console.error("[BACKEND] Supabase profiles error:", profileError);
      return res.status(500).json({ success: false, error: profileError.message });
    }

    console.log("[BACKEND] Guardado en Supabase:", userId);

    return res.status(200).json({
      success: true,
      userId,
      walletAddress: walletAddress || null,
      minikitData: minikitData || null,
      profile: profileData || null,
      worldProof: worldProofData || null
    });

  } catch (err) {
    console.error("[BACKEND] Supabase error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

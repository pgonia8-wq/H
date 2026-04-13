import { supabase, cors } from "./_supabase.mjs";

const APP_ID = process.env.APP_ID ?? "";
const ACTION_ID = process.env.WORLDCOIN_ACTION_ID ?? "user-orb";

export default async function handler(req, res) {
  cors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { payload, userId } = req.body ?? {};

  if (
    !payload ||
    !payload.nullifier_hash ||
    !payload.proof ||
    !payload.merkle_root ||
    !payload.verification_level
  ) {
    return res.status(400).json({ error: "Missing proof fields" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const nullifierHash = payload.nullifier_hash;
  const verLevel = payload.verification_level;

  if (verLevel !== "orb") {
    return res.status(403).json({
      error: "ORB verification required. Device-level is not sufficient.",
      receivedLevel: verLevel,
    });
  }

  let existingProfile;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, verified, verification_level, orb_verified_at, nullifier_hash")
      .eq("id", userId)
      .maybeSingle();
    existingProfile = data;
  } catch (err) {
    console.error("[VERIFY_ORB] Profile lookup failed:", err.message);
    return res.status(500).json({ error: "Could not verify user identity" });
  }

  if (!existingProfile) {
    return res.status(404).json({
      error: "User profile not found. Complete device verification first.",
      code: "PROFILE_NOT_FOUND",
    });
  }

  if (existingProfile.verification_level === "orb") {
    if (existingProfile.nullifier_hash && existingProfile.nullifier_hash !== nullifierHash) {
      return res.status(409).json({
        error: "ORB proof does not match the one bound to this account.",
        code: "NULLIFIER_BINDING_CONFLICT",
      });
    }
    return res.status(200).json({
      success: true,
      orbVerified: true,
      reused: true,
    });
  }

  if (existingProfile.nullifier_hash && existingProfile.nullifier_hash !== nullifierHash) {
    return res.status(409).json({
      error: "A different ORB proof is already bound to this account.",
      code: "NULLIFIER_BINDING_CONFLICT",
    });
  }

  try {
    const { data: nullifierUsed } = await supabase
      .from("profiles")
      .select("id")
      .eq("nullifier_hash", nullifierHash)
      .neq("id", userId)
      .maybeSingle();

    if (nullifierUsed) {
      return res.status(409).json({
        error: "This ORB proof has already been used by another account.",
        code: "NULLIFIER_REPLAY",
      });
    }
  } catch (err) {
    console.warn("[VERIFY_ORB] Nullifier replay check failed:", err.message);
  }

  let verifyData;
  try {
    const verifyResponse = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${APP_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: ACTION_ID,
          merkle_root: payload.merkle_root,
          proof: payload.proof,
          nullifier_hash: nullifierHash,
          verification_level: verLevel,
        }),
      }
    );

    verifyData = await verifyResponse.json();

    const isSuccess =
      verifyResponse.ok &&
      (verifyData.success === true || verifyData.success === "true");

    if (!isSuccess) {
      return res.status(verifyResponse.status || 400).json({
        error: verifyData.detail ?? verifyData.error ?? "Worldcoin verification failed",
      });
    }
  } catch (err) {
    console.error("[VERIFY_ORB] Network error:", err.message);
    return res.status(502).json({ error: "Could not contact Worldcoin" });
  }

  try {
    const { error: upsertError } = await supabase
      .from("profiles")
      .update(
        {
          verified: true,
          verification_level: "orb",
          nullifier_hash: nullifierHash,
          orb_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      )
      .eq("id", userId);

    if (upsertError) {
      console.error("[VERIFY_ORB] Update error:", upsertError.message);
      return res.status(500).json({ error: upsertError.message });
    }
  } catch (err) {
    console.error("[VERIFY_ORB] DB error:", err.message);
    return res.status(500).json({ error: "Database error saving verification" });
  }

  await supabase.rpc("log_audit", {
    p_event: "orb_verified",
    p_user: userId,
    p_details: JSON.stringify({ nullifier_hash: nullifierHash }),
  }).catch(() => {});

  return res.status(200).json({
    success: true,
    orbVerified: true,
  });
}

import { createClient } from "@supabase/supabase-js";
import { verifyCloudProof } from "@worldcoin/idkit-core";

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req) {
  console.log("[BACKEND] Verificando World ID...");

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const payload = body?.payload;
    const usernameFromClient = body?.username || null;

    if (!payload) {
      return new Response(
        JSON.stringify({ success: false, error: "No payload received" }),
        { status: 400 }
      );
    }

    console.log("[BACKEND] Payload recibido:", payload);

    const cloudProof = {
      merkle_root: payload.merkle_root,
      nullifier_hash: payload.nullifier_hash,
      proof: payload.proof
    };

    const verification = await verifyCloudProof(
      cloudProof,
      APP_ID,
      "verify-user"
    );

    if (!verification.success) {
      console.log("[BACKEND] Proof inválido:", verification);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid proof",
          details: verification.code || verification.detail
        }),
        { status: 400 }
      );
    }

    const nullifierHash = payload.nullifier_hash;

    // buscar perfil existente
    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", nullifierHash)
      .maybeSingle();

    if (selectError) throw selectError;

    let profile = existing;

    // crear perfil si no existe
    if (!profile) {
      console.log("[BACKEND] Creando profile nuevo");

      const username =
        usernameFromClient ||
        `anon-${nullifierHash.slice(0, 8)}`;

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: nullifierHash,
          tier: "free",
          username: username,
          avatar_url: "",
          created_at: new Date().toISOString(),
          profile_visible: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      profile = inserted;

      console.log("[BACKEND] Profile creado:", profile.id);
    } else {
      console.log("[BACKEND] Profile existente:", profile.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        nullifier_hash: nullifierHash,
        profile
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("[BACKEND] ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Internal server error"
      }),
      { status: 500 }
    );
  }
}

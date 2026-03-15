// /api/verify.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[VERIFY] Missing Supabase env vars");
  // NO usamos return fuera de función
  // lanzamos error para detener la carga
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(request) {
  console.log("[VERIFY] Request recibida:", {
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // --- CORRECCIÓN: obtenemos el body directamente ---
    const body = typeof request.body === "object" ? request.body : JSON.parse(request.body || "{}");
    console.log("[VERIFY] Body parseado - keys:", Object.keys(body));

    // Según docs Worldcoin, payload viene directo
    const payload = body.payload;
    if (!payload) {
      console.error("[VERIFY] Missing payload");
      return new Response(
        JSON.stringify({ success: false, error: "Missing payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificamos status
    if (payload.status !== "success") {
      console.warn("[VERIFY] Verification failed:", payload.status);
      return new Response(
        JSON.stringify({ success: false, error: "Verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const nullifierHash = payload.nullifier_hash;
    const userId = body.userId || nullifierHash;

    console.log("[VERIFY] Buscando perfil...");
    let { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("nullifier_hash", nullifierHash)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        console.log("[VERIFY] Perfil no encontrado - creando...");
      } else {
        console.error("[VERIFY] Fetch error:", fetchError.message);
        throw fetchError;
      }
    }

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          nullifier_hash: nullifierHash,
          username: body.username || `user_${nullifierHash.slice(0, 8)}`,
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("[VERIFY] Insert error:", insertError.message);
        throw insertError;
      }
      profile = newProfile;
    } else {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("[VERIFY] Update error:", updateError.message);
        throw updateError;
      }
    }

    console.log("[VERIFY] Éxito - respondiendo 200");
    return new Response(
      JSON.stringify({
        success: true,
        nullifier_hash: nullifierHash,
        profile,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[VERIFY] CRASH:", err.message, err.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
       }

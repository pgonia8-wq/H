// Nuevo endpoint: verifica que el nonce del walletAuth fue emitido por nosotros
// y que no ha expirado, resolviendo el Error #2 (nonce sin verificación).
// El frontend debe llamar este endpoint DESPUÉS de completar walletAuth con MiniKit.

import { verifySignedNonce } from "./nonce.mjs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const { nonce, address, status } = req.body || {};

  if (!nonce || !address || !status) {
    console.error("[WALLET-VERIFY] Faltan campos:", { nonce: !!nonce, address: !!address, status });
    return res.status(400).json({ success: false, error: "Faltan campos: nonce, address, status" });
  }

  // Verificar que el nonce fue firmado por nosotros y que no expiró (máx 5 minutos)
  const nonceValid = verifySignedNonce(nonce, 5 * 60 * 1000);
  if (!nonceValid) {
    console.error("[WALLET-VERIFY] Nonce inválido o expirado");
    return res.status(400).json({ success: false, error: "Nonce inválido o expirado. Reinicia la autenticación." });
  }

  if (status !== "success") {
    console.warn("[WALLET-VERIFY] WalletAuth no completado. Status:", status);
    return res.status(400).json({ success: false, error: "WalletAuth no completado" });
  }

  console.log("[WALLET-VERIFY] Wallet autenticada correctamente:", address);
  return res.status(200).json({ success: true, address });
}

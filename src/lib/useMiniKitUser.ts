import { useState, useEffect } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

export function useMiniKitUser() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (MiniKit.isInstalled()) {
        const w = MiniKit.walletAddress;
        if (w) setWallet(w);
      }
    } catch (err) {
      console.error("MiniKit read error:", err);
      setError("Error al leer estado de MiniKit");
    }
  }, []);

  const verifyUser = async () => {
    if (!wallet || verifying) return;

    setVerifying(true);
    setError(null);

    try {
      const verifyRes = await MiniKit.commandsAsync.verify({
        action: "verify-user",
        signal: wallet,
        verification_level: VerificationLevel.Device
      });

      const proof = verifyRes?.finalPayload;

      if (!proof) throw new Error("No se recibió proof");

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: proof })
      });

      const backend = await res.json();

      if (backend.success) {
        setVerified(true);
      } else {
        setError("Backend rechazó la prueba");
      }

    } catch (err: any) {
      console.error("Verify error:", err);
      setError(err.message || "Error durante verificación");
    } finally {
      setVerifying(false);
    }
  };

  return { wallet, verified, verifying, error, verifyUser };
}

import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";

const App = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [miniKitReady, setMiniKitReady] = useState(false);

  // Inicializar MiniKit
  useEffect(() => {
    try {
      console.log("[APP] Instalando MiniKit...");
      MiniKit.install({ appId: APP_ID });
      const installed = MiniKit.isInstalled();
      console.log("[APP] MiniKit.isInstalled():", installed);
      if (!installed) {
        console.error("[APP] MiniKit no está disponible");
        setError("MiniKit no instalado");
        return;
      }
      setMiniKitReady(true);
      console.log("[APP] MiniKit listo");
    } catch (err) {
      console.error("[APP] Error instalando MiniKit:", err);
      setError("Error instalando MiniKit");
    }
  }, []);

  // Verificación forzada
  useEffect(() => {
    const forceVerify = async () => {
      if (!miniKitReady || verifying || verified) return;

      console.log("[APP] Forzando verificación...");

      setVerifying(true);
      setError(null);

      try {
        const verifyRes = await MiniKit.commandsAsync.verify({
          action: "verify-user",
          verification_level: VerificationLevel.Device,
        });

        console.log("[APP] Verify response:", verifyRes);
        const proof = verifyRes?.finalPayload;

        if (!proof || proof.status !== "success") {
          throw new Error("Verificación cancelada o fallida");
        }

        // Enviar proof al backend
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: proof }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Backend error: ${text}`);
        }

        const backend = await res.json();
        console.log("[APP] Backend verify:", backend);

        if (backend.success) {
          const id = proof.nullifier_hash;
          setUserId(id);
          setVerified(true);
          console.log("[APP] Usuario verificado:", id);
        } else {
          throw new Error(backend.error || "Backend rechazó la prueba");
        }
      } catch (err: any) {
        console.error("[APP] Error verificando usuario:", err);
        setError(err.message || "Error verificando usuario");
      } finally {
        setVerifying(false);
      }
    };

    forceVerify();
  }, [miniKitReady, verifying, verified]);

  // Cargar wallet solo si hay userId
  useEffect(() => {
    const loadWallet = async () => {
      if (!userId || wallet || !miniKitReady) return;

      try {
        console.log("[APP] Iniciando walletAuth...");
        const nonceRes = await fetch("/api/nonce");
        if (!nonceRes.ok) throw new Error("No se pudo obtener nonce");
        const { nonce } = await nonceRes.json();
        console.log("[APP] Nonce recibido:", nonce);

        const auth = await MiniKit.commandsAsync.walletAuth({
          nonce,
          requestId: "wallet-auth-" + Date.now(),
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(Date.now() - 60 * 1000),
          statement: "Autenticar wallet para H humans",
        });

        console.log("[APP] walletAuth result:", auth);

        if (auth?.finalPayload?.status === "success") {
          const address =
            auth.finalPayload.address ||
            auth.finalPayload.wallet_address ||
            null;
          if (address) {
            setWallet(address);
            console.log("[APP] Wallet obtenida:", address);
          }
        }
      } catch (err: any) {
        console.error("[APP] Error walletAuth:", err);
        setError(err.message || "Error autenticando wallet");
      }
    };

    loadWallet();
  }, [userId, miniKitReady, wallet]);

  // No renderizar HomePage hasta que usuario esté verificado
  if (!verified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        {verifying ? "Verificando usuario..." : error || "Esperando verificación..."}
      </div>
    );
  }

  return (
    <HomePage
      userId={userId}
      verified={verified}
      wallet={wallet}
      error={error}
      verifying={verifying}
      setUserId={setUserId}
    />
  );
};

export default App;

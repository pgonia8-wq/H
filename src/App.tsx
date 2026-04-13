import React, { useState, useEffect, useRef } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useTheme } from "./lib/ThemeContext";
import HomePage from "./pages/HomePage";

// Sincronizar con las variables de entorno para evitar errores de paridad
const WORLDCOIN_ACTION = import.meta.env.VITE_WORLDCOIN_ACTION_ID || "verify-user";

const App = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [miniKitReady, setMiniKitReady] = useState(false);
  const [orbVerifying, setOrbVerifying] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const walletLoading = useRef(false);

  const { setUsername: setGlobalUsername } = useTheme();

  useEffect(() => {
    const init = async () => {
      const isInstalled = MiniKit.isInstalled();
      setMiniKitReady(isInstalled);

      if (isInstalled && MiniKit.user) {
        // Si el usuario en MiniKit cambia, limpiamos cache local para evitar desincronización
        const currentMiniKitId = (MiniKit.user as any).walletAddress; 
        const u = MiniKit.user.username || null;
        if (u) { setUsername(u); setGlobalUsername(u); }
      }

      const storedId = localStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
        try {
          const profileRes = await fetch(`/api/get-profile?userId=${encodeURIComponent(storedId)}`);
          if (profileRes.ok) {
            const { profile } = await profileRes.json();
            if (profile?.verified) {
              setVerified(true);
            }
          } else {
            localStorage.removeItem("userId");
            setUserId(null);
          }
        } catch (e) {
          console.warn("[App] Error validando sesión persistente.");
        }
      }

      const cachedWallet = localStorage.getItem("wallet");
      if (cachedWallet) setWallet(cachedWallet);
    };

    init();
  }, []);

  // Manejo de Wallet Auth
  useEffect(() => {
    const loadWallet = async () => {
      if (!verified || wallet || !miniKitReady || walletLoading.current) return;

      walletLoading.current = true;
      try {
        const nonceRes = await fetch("/api/nonce");
        const { nonce } = await nonceRes.json();

        const auth = await MiniKit.commandsAsync.walletAuth({
          nonce,
          requestId: "wallet-auth-" + Date.now(),
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          statement: "Autenticar cuenta en H Humans",
        });

        const payload = auth?.finalPayload;
        if (payload?.status !== "error" && payload?.address) {
          const verifyRes = await fetch("/api/walletVerify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload, nonce, userId }),
          });
          const vData = await verifyRes.json();
          if (vData.success) {
            setWallet(vData.address);
            localStorage.setItem("wallet", vData.address);
          }
        }
      } catch (err) {
        console.error("[App] Wallet flow failed", err);
      } finally {
        walletLoading.current = false;
      }
    };

    loadWallet();
  }, [verified, miniKitReady]);

  const runVerification = async () => {
    setVerifying(true);
    setError(null);

    try {
      if (!MiniKit.isInstalled()) throw new Error("MiniKit no detectado");

      const verifyRes = await MiniKit.commandsAsync.verify({
        action: WORLDCOIN_ACTION, // Uso de constante sincronizada
        signal: userId ?? "",
        verification_level: VerificationLevel.Device,
      });

      const proof = verifyRes?.finalPayload;
      if (proof?.status === "error") throw new Error("La verificación fue cancelada.");

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: proof }),
      });

      const result = await res.json();

      if (result.success) {
        const id = proof.nullifier_hash;
        localStorage.setItem("userId", id);
        setUserId(id);
        setVerified(true);
      } else {
        throw new Error(result.error || "Fallo en la validación del backend.");
      }
    } catch (err: any) {
      setError(err.message || "Error al verificar");
    } finally {
      setVerifying(false);
    }
  };

  // Función para niveles superiores (Orb)
  const verifyOrb = async (): Promise<{ success: boolean; proof?: any }> => {
    if (!miniKitReady || orbVerifying) return { success: false };
    setOrbVerifying(true);
    try {
      const verifyRes = await MiniKit.commandsAsync.verify({
        action: "user-orb",
        signal: userId ?? "",
        verification_level: VerificationLevel.Orb,
      });
      const proof = verifyRes?.finalPayload;
      return { success: proof?.verification_level === "orb", proof };
    } catch (err) {
      return { success: false };
    } finally {
      setOrbVerifying(false);
    }
  };

  return (
    <HomePage
      userId={userId}
      verifyUser={runVerification}
      verified={verified}
      wallet={wallet}
      username={username}
      avatar={avatar}
      error={error}
      verifying={verifying}
      setUserId={setUserId}
      verifyOrb={verifyOrb}
    />
  );
};

export default App;

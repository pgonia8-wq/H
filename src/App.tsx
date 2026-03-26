import React, { useState, useEffect, useRef } from "react";
import HomePage from "./pages/HomePage";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useTheme } from "./lib/ThemeContext";

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";

const App = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [miniKitReady, setMiniKitReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const walletLoading = useRef(false);

  const { setUsername: setGlobalUsername } = useTheme();

  // ✅ Cargar ID (SIN bloquear la app)
  useEffect(() => {
    const storedId = localStorage.getItem("userId");

    if (storedId) {
      setUserId(storedId);
      setVerified(true);
      console.log("[APP] ID cargado:", storedId);
    } else {
      console.log("[APP] Usuario no verificado aún");
    }
  }, []);

  // ✅ Inicializar MiniKit (no bloquea UI)
  useEffect(() => {
    const initMiniKit = async () => {
      try {
        MiniKit.install({ appId: APP_ID });

        if (!MiniKit.isInstalled()) {
          console.warn("[APP] MiniKit no disponible");
          return;
        }

        setMiniKitReady(true);

        if (MiniKit.user) {
          const u = MiniKit.user.username || null;
          const a = MiniKit.user.avatar_url || null;
          setUsername(u);
          setAvatar(a);
          if (u) setGlobalUsername(u);
        }
      } catch (err) {
        console.error("[APP] MiniKit error:", err);
        setError("MiniKit error");
      }
    };

    initMiniKit();
  }, []);

  // ✅ WalletAuth en background (NO bloquea UI)
  useEffect(() => {
    const loadWallet = async () => {
      if (!verified || wallet || verifying || !miniKitReady || walletLoading.current) {
        return;
      }

      walletLoading.current = true;

      try {
        const nonceRes = await fetch("/api/nonce");
        if (!nonceRes.ok) throw new Error("No nonce");

        const { nonce } = await nonceRes.json();

        const auth = await MiniKit.commandsAsync.walletAuth({
          nonce,
          requestId: "wallet-auth-" + Date.now(),
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(Date.now() - 60 * 1000),
          statement: "Autenticar wallet para H humans",
        });

        const address =
          auth?.finalPayload?.address ||
          auth?.finalPayload?.wallet_address ||
          null;

        if (address) setWallet(address);

        if (MiniKit.user) {
          const u = MiniKit.user.username || null;
          const a = MiniKit.user.avatar_url || null;
          setUsername(u);
          setAvatar(a);
          if (u) setGlobalUsername(u);
        }
      } catch (err: any) {
        console.error("[APP] walletAuth error:", err);
        setError(err.message);
      } finally {
        walletLoading.current = false;
      }
    };

    loadWallet();
  }, [verified, wallet, verifying, miniKitReady]);

  // ✅ Verify manual (NO automático)
  const verifyUser = async () => {
    if (verifying || !miniKitReady) return;

    setVerifying(true);
    setError(null);

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit no instalado");
      }

      const verifyRes = await MiniKit.commandsAsync.verify({
        action: "verify-user",
        verification_level: VerificationLevel.Device,
      });

      const proof = verifyRes?.finalPayload;
      if (!proof) throw new Error("No proof");

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: proof }),
      });

      if (!res.ok) {
        const text = await res.text();

        if (text.includes("already verified") && proof.nullifier_hash) {
          const id = proof.nullifier_hash;
          localStorage.setItem("userId", id);
          setUserId(id);
          setVerified(true);
          return;
        }

        throw new Error(text);
      }

      const backend = await res.json();

      if (backend.success && proof.nullifier_hash) {
        const id = proof.nullifier_hash;
        localStorage.setItem("userId", id);
        setUserId(id);
        setVerified(true);
      } else {
        throw new Error(backend.error);
      }
    } catch (err: any) {
      console.error("[APP] verify error:", err);
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  // ✅ Loader REAL (rápido, no bloqueante)
  if (!miniKitReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse" />
          <p className="text-sm text-white/60">Loading Humans...</p>
        </div>
      </div>
    );
  }

  return (
    <HomePage
      userId={userId}
      verifyUser={verifyUser}
      verified={verified}
      wallet={wallet}
      username={username}
      avatar={avatar}
      error={error}
      verifying={verifying}
      setUserId={setUserId}
    />
  );
};

export default App;

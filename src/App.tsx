import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";

const App = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [miniKitReady, setMiniKitReady] = useState(false);

  // Carga datos locales al montar
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
      setVerified(true);
      console.log("[APP] User ID cargado:", storedId);
    }

    const storedWallet = localStorage.getItem("wallet");
    if (storedWallet) setWallet(storedWallet);

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

  // Inicializa MiniKit
  useEffect(() => {
    try {
      MiniKit.install({ appId: APP_ID });
      if (MiniKit.isInstalled()) {
        setMiniKitReady(true);
        const w = MiniKit.walletAddress;
        if (w) {
          setWallet(w);
          localStorage.setItem("wallet", w);
        }
      }
    } catch (err) {
      console.error("[APP] MiniKit init error:", err);
      setError("MiniKit no se pudo inicializar");
    }
  }, []);

  // Cargar wallet si está verificado pero no cargada
  useEffect(() => {
    const loadWallet = async () => {
      if (!verified || wallet || walletLoading || !miniKitReady) return;
      setWalletLoading(true);

      try {
        const nonceRes = await fetch("/api/nonce");
        if (!nonceRes.ok) throw new Error("Error obteniendo nonce");
        const { nonce } = await nonceRes.json();

        const authResult = await Promise.race([
          MiniKit.commandsAsync.walletAuth({
            nonce,
            requestId: "wallet-auth-" + Date.now(),
            expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
            statement: "Autenticar wallet para H humans y compartir mi username público",
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout en walletAuth (30s)")), 30000)
          ),
        ]);

        if (authResult?.finalPayload?.status === "success") {
          const w = authResult.finalPayload.address;
          setWallet(w);
          localStorage.setItem("wallet", w);
        } else {
          throw new Error("walletAuth falló");
        }
      } catch (err: any) {
        console.error("[APP] Error walletAuth:", err);
        setError(err.message || "Error al autenticar wallet");
      } finally {
        setWalletLoading(false);
      }
    };

    loadWallet();
  }, [verified, wallet, walletLoading, miniKitReady]);

  // Verificación World ID
  const verifyUser = async () => {
    if (verifying) return;
    if (userId) return;

    setVerifying(true);
    setError(null);

    try {
      if (!MiniKit.isInstalled()) throw new Error("MiniKit no está instalado.");

      const verifyRes = await Promise.race([
        MiniKit.commandsAsync.verify({
          action: "verify-user",
          verification_level: VerificationLevel.Device,
          signal: "h-humans-login-" + Date.now(),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout en verificación (30s)")), 30000)
        ),
      ]);

      const proof = verifyRes?.finalPayload;
      if (!proof || proof.status !== "success") throw new Error("Verificación fallida");

      // Enviar proof al backend verify.mjs
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: proof }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error: ${res.status} - ${text}`);
      }

      const backend = await res.json();
      if (!backend.success) throw new Error(backend.error || "Backend rechazó la verificación");

      const id = proof.nullifier_hash;
      localStorage.setItem("userId", id);
      setUserId(id);
      setVerified(true);

      // Ahora pedimos username y avatar del profile
      const profileRes = await fetch("/api/get-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      if (!profileRes.ok) throw new Error("No se pudo obtener profile");
      const profileData = await profileRes.json();
      if (profileData?.profile) {
        setUsername(profileData.profile.username || null);
        setAvatar(profileData.profile.avatar_url || null);
        localStorage.setItem("username", profileData.profile.username || "");
        localStorage.setItem("avatar", profileData.profile.avatar_url || "");
      }
    } catch (err: any) {
      console.error("[APP] verifyUser error:", err);
      setError(err.message || "Error al verificar con World ID");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      {walletLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Cargando wallet...</p>
          </div>
        </div>
      )}

      {verifying && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Verificando identidad con World ID...</p>
          </div>
        </div>
      )}

      {(!userId || !verified) && !walletLoading && !verifying ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <p className="text-center">Cargando sesión... verifica con World ID</p>
        </div>
      ) : (
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
      )}
    </>
  );
};

export default App;

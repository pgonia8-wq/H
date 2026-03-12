import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";

const App = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);   // ← Nuevo
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [miniKitReady, setMiniKitReady] = useState(false);

  // Carga desde localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
      setVerified(true);
      console.log("[APP] ID cargado:", storedId);
    }

    const storedWallet = localStorage.getItem("wallet");
    if (storedWallet) {
      setWallet(storedWallet);
      console.log("[APP] Wallet cargada de localStorage:", storedWallet);
    }

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      console.log("[APP] Username cargado de localStorage:", storedUsername);
    }
  }, []);

  // Inicializa MiniKit
  useEffect(() => {
    try {
      MiniKit.install({ appId: APP_ID });
      const installed = MiniKit.isInstalled();
      console.log("[APP] MiniKit.isInstalled():", installed);
      if (installed) setMiniKitReady(true);
    } catch (err) {
      console.error("[APP] Error instalando MiniKit:", err);
    }
  }, []);

  // Carga wallet + username
  useEffect(() => {
    const loadWalletAndUsername = async () => {
      if (!verified || wallet || walletLoading || !miniKitReady) return;

      setWalletLoading(true);
      console.log("[APP] Iniciando walletAuth...");

      try {
        const nonceRes = await fetch("/api/nonce");
        const { nonce } = await nonceRes.json();

        const authResult = await MiniKit.commandsAsync.walletAuth({
          nonce,
          requestId: "wallet-auth-" + Date.now(),
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
          statement: "Autenticar wallet para H humans y compartir mi username público",
        });

        console.log("[APP] walletAuth resultado completo:", authResult);

        if (authResult?.finalPayload?.status === "success") {
          const w = authResult.finalPayload.address;

          // ← Aquí está la forma correcta de obtener el username según docs oficiales
          let u = authResult.finalPayload.username || MiniKit.user?.username;

          // Fallback extra si no llega
          if (!u) {
            const userData = await MiniKit.getUserByAddress(w);
            u = userData?.username;
          }

          setWallet(w);
          setUsername(u || `@anon-${w.slice(2, 10)}`);

          localStorage.setItem("wallet", w);
          if (u) localStorage.setItem("username", u);

          console.log("[APP] Wallet:", w);
          console.log("[APP] Username obtenido:", u || "No disponible (se usará fallback)");
        }
      } catch (err: any) {
        console.error("[APP] Error walletAuth:", err);
        setError(err.message);
      } finally {
        setWalletLoading(false);
      }
    };

    loadWalletAndUsername();
  }, [verified, wallet, walletLoading, miniKitReady]);

  const verifyUser = async () => { ... }; // tu función verifyUser original (sin cambios)

  return (
    <>
      {walletLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Cargando wallet y username...</p>
          </div>
        </div>
      )}

      {(!userId || !verified) && !walletLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <p>Cargando sesión... verifica con World ID</p>
        </div>
      ) : (
        <HomePage
          userId={userId}
          verifyUser={verifyUser}
          verified={verified}
          wallet={wallet}
          username={username}          // ← Ahora pasa el username real
          error={error}
          verifying={verifying}
          setUserId={setUserId}
        />
      )}
    </>
  );
};

export default App;

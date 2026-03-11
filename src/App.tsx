import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { MiniKit } from "@worldcoin/minikit-js";

interface AppProps {
  initialUserId: string | null;  // Viene de World App tras verify
  initialWallet: string | null;  // WalletAuth ya hecha por World App
}

const APP_ID = "app_6a98c88249208506dcd4e04b529111fc";

const App = ({ initialUserId, initialWallet }: AppProps) => {
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [wallet, setWallet] = useState<string | null>(initialWallet);
  const [miniKitReady, setMiniKitReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar MiniKit si no está instalado (solo UI interno)
  useEffect(() => {
    try {
      MiniKit.install({ appId: APP_ID });
      const installed = MiniKit.isInstalled();
      console.log("[APP] MiniKit instalado:", installed);
      setMiniKitReady(installed);
    } catch (err) {
      console.error("[APP] Error inicializando MiniKit:", err);
      setError("Error inicializando MiniKit");
    }
  }, []);

  // Solo log para debug
  useEffect(() => {
    console.log("[APP] userId recibido:", userId);
    console.log("[APP] wallet recibido:", wallet);
  }, [userId, wallet]);

  return (
    <HomePage
      userId={userId}
      wallet={wallet}
      error={error}
      miniKitReady={miniKitReady}
    />
  );
};

export default App;

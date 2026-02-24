import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { MiniKit } from "@worldcoin/minikit-js";

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!MiniKit.isInstalled()) {
        setError("Esta app solo funciona dentro de World App");
        return;
      }

      // Espera extra para que el bridge esté listo
      await new Promise(r => setTimeout(r, 1200));

      try {
        const wallet = await MiniKit.commandsAsync.getWallet();
        if (wallet?.address) {
          setWalletAddress(wallet.address);
        } else {
          setError("No se detectó wallet en World App");
        }
      } catch (err) {
        console.error(err);
        setError("Error al obtener wallet");
      }
    };

    init();
  }, []);

  const startVerification = async () => {
    if (!walletAddress || verifying) return;

    setVerifying(true);
    setError(null);

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "verify_user",        // ← debe existir en tu Developer Portal
        signal: walletAddress,
      });

      if (finalPayload.status === "error") {
        setError("Verificación rechazada por World App");
        return;
      }

      // Enviar al backend
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          action: "verify_user",
          signal: walletAddress,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setVerified(true);
        setError(null);
      } else {
        setError("Verificación rechazada por el servidor");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes("rejected") 
        ? "Verificación rechazada por World App o el usuario" 
        : "Error en la verificación");
    } finally {
      setVerifying(false);
    }
  };

  // Pantalla de carga inicial
  if (!walletAddress && !error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl">Iniciando World ID...</p>
      </div>
    );
  }

  // Error o rechazo
  if (error || !verified) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white text-center p-8 gap-6">
        <div className="text-2xl font-bold">Human Feed</div>
        
        <div className="text-red-400 text-lg font-medium">
          {error || "Verificación rechazada por World App o el usuario"}
        </div>

        <button
          onClick={startVerification}
          disabled={verifying}
          className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg active:scale-95"
        >
          {verifying ? "Verificando..." : "Verificar con World ID"}
        </button>

        <p className="text-xs text-gray-500">Solo funciona dentro de World App</p>
      </div>
    );
  }

  // App principal (cuando está verificado)
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Human Feed</h1>
        <div className="text-xs font-mono text-green-400">
          {walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <FeedPage wallet={walletAddress!} />
      </main>
    </div>
  );
};

export default App;

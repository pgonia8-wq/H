import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { useMiniKitUser } from "./lib/useMiniKitUser";
import { MiniKit } from "@worldcoin/minikit-js";

const App: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    const init = async () => {
      if (!MiniKit.isInstalled()) {
        setStatus("not-installed");
        return;
      }

      try {
        const wallet = await MiniKit.commandsAsync.getWallet();
        if (wallet?.address) {
          setWalletAddress(wallet.address);
          setStatus("found");
        } else {
          setStatus("no-wallet");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };
    init();
  }, []);

  useEffect(() => {
    const doVerify = async () => {
      if (status !== "found" || !walletAddress || verified || verifying) return;

      setVerifying(true);
      try {
        const { finalPayload } = await MiniKit.commandsAsync.verify({
          action: "verify_user",
          signal: walletAddress,
        });

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
        }
      } catch (err) {
        console.error("Verification failed", err);
      } finally {
        setVerifying(false);
      }
    };

    doVerify();
  }, [status, walletAddress, verified, verifying]);

  if (status === "initializing" || verifying) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium">Iniciando World ID...</p>
      </div>
    );
  }

  if (status === "not-installed") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-8">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
          <p className="text-gray-400">Esta aplicación solo funciona dentro de World App para garantizar que todos los usuarios sean humanos reales.</p>
        </div>
      </div>
    );
  }

  if (!walletAddress || !verified) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white text-center p-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl font-bold">W</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verificación Humana</h1>
        <p className="text-gray-400 mb-8">Por favor, completa la verificación de World ID para continuar.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Reintentar Verificación
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col font-sans">
      <header className="border-b border-gray-800 p-4 sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <h1 className="text-xl font-bold italic tracking-tighter">HUMAN</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto border-x border-gray-800">
        <FeedPage />
      </main>
    </div>
  );
};

export default App;

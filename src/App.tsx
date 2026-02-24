import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { MiniKit } from "@worldcoin/minikit-js";

const App: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<"initializing" | "not-installed" | "found" | "no-wallet" | "error">("initializing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      console.log("Iniciando MiniKit...");

      // Buffer inicial para que MiniKit.install() (en main.tsx) termine de configurar el bridge
      await new Promise(resolve => setTimeout(resolve, 2000)); // 1 segundo, ajusta a 1500 si sigue fallando

      if (!MiniKit.isInstalled()) {
        console.log("MiniKit no está instalado");
        setStatus("not-installed");
        setErrorMessage("Esta app solo funciona dentro de World App.");
        return;
      }

      console.log("MiniKit instalado, obteniendo wallet...");

      try {
        const wallet = await MiniKit.commandsAsync.getWallet();
        if (wallet?.address) {
          console.log("Wallet encontrado:", wallet.address);
          setWalletAddress(wallet.address);
          setStatus("found");

          // Proceder directamente a verify (sin esperar otro useEffect)
          setVerifying(true);
          try {
            console.log("Iniciando verificación con signal:", wallet.address);
            const { finalPayload } = await MiniKit.commandsAsync.verify({
              action: "verify_user",
              signal: wallet.address,
            });

            const res = await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                payload: finalPayload,
                action: "verify_user",
                signal: wallet.address,
              }),
            });

            const result = await res.json();
            if (result.success) {
              console.log("Verificación exitosa");
              setVerified(true);
            } else {
              console.error("Verificación falló en backend:", result);
              setErrorMessage("Verificación fallida. Intenta de nuevo.");
            }
          } catch (verifyErr) {
            console.error("Error en verify:", verifyErr);
            setErrorMessage("No se pudo completar la verificación de World ID.");
          } finally {
            setVerifying(false);
          }
        } else {
          console.log("No se encontró wallet");
          setStatus("no-wallet");
          setErrorMessage("No se detectó wallet en World App.");
        }
      } catch (err) {
        console.error("Error general en inicialización:", err);
        setStatus("error");
        setErrorMessage("Error al conectar con World App. Cierra y abre de nuevo.");
      }
    };

    initializeApp();
  }, []); // Solo se ejecuta una vez al montar

  // Pantalla de loading / verificando
  if (status === "initializing" || verifying) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium">Iniciando World ID...</p>
        <p className="text-sm mt-4 opacity-70">Espera unos segundos, no cierres la app</p>
      </div>
    );
  }

  // MiniKit no instalado
  if (status === "not-installed" || status === "error") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-8">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Acceso Restringido / Error</h1>
          <p className="text-gray-400 mb-6">{errorMessage || "Esta aplicación solo funciona dentro de World App."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No wallet o no verificado
  if (!walletAddress || !verified) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white text-center p-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl font-bold">W</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verificación Humana Requerida</h1>
        <p className="text-gray-400 mb-8">{errorMessage || "Completa la verificación de World ID para continuar."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Reintentar Verificación
        </button>
      </div>
    );
  }

  // App principal cuando todo OK
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

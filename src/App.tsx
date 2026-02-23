import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { useMiniKitUser } from "./lib/useMiniKitUser";
import { MiniKit } from "@worldcoin/minikit-js";

const App: React.FC = () => {
  const { walletAddress, status, verifyOrb, proof, isVerifying } = useMiniKitUser();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Logs de debug detallados
  useEffect(() => {
    console.log('🔍 MiniKit.isInstalled desde App:', MiniKit.isInstalled?.() ?? 'no disponible');
    console.log('🔍 Status actual:', status ?? 'sin-status');
    console.log('🔍 Wallet address:', walletAddress ?? 'sin-wallet');
    console.log('🔍 isVerifying:', isVerifying);
    console.log('🔍 verified:', verified);
    console.log('🔍 Intentos de retry:', retryCount);
  }, [status, walletAddress, isVerifying, verified, retryCount]);

  // Timeout de 20 segundos para detectar si está atascado en carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 20000); // 20 segundos

    return () => clearTimeout(timer);
  }, []);

  // Verificación solo cuando status sea "found"
  useEffect(() => {
    if (status !== "found" || !walletAddress || verified) {
      console.log('⏳ Esperando status "found"... actual:', status);
      return;
    }

    const doVerify = async () => {
      setVerifying(true);
      try {
        console.log("🚀 Iniciando verificación Orb - wallet:", walletAddress);
        const orbProof = await verifyOrb("verify_user", walletAddress);

        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: orbProof,
            action: "verify_user",
            signal: walletAddress,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setVerified(true);
          console.log("✅ Verificación exitosa");
        } else {
          console.error("❌ Backend rechazó el proof:", result);
        }
      } catch (err) {
        console.error("❌ Error completo en verificación:", err);
      } finally {
        setVerifying(false);
      }
    };

    doVerify();
  }, [status, walletAddress, verified, verifyOrb]);

  // Pantalla de carga / inicializando / polling / verifying
  if (!status || status === "initializing" || status === "polling" || isVerifying || verifying) {
    if (loadTimeout) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6 gap-6">
          <div className="text-xl font-bold">Cargando World ID... (tomando mucho tiempo)</div>
          <div>Status: {status || 'esperando bridge'}</div>
          <div>Intentos: {retryCount}</div>
          <button
            onClick={() => {
              setRetryCount(c => c + 1);
              setLoadTimeout(false); // resetea timeout
              window.location.reload();
            }}
            className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg active:scale-95 transition-transform"
          >
            Reintentar ahora
          </button>
        </div>
      );
    }

    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Cargando World ID...<br />
        Status: {status || 'esperando bridge'}<br />
        Intentos: {retryCount}
      </div>
    );
  }

  // Error / no detectado / timeout / not-installed
  if (!walletAddress || status === "not-installed" || status === "timeout" || status === "error") {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6 gap-6">
        <div className="text-xl font-bold">
          Esta aplicación solo funciona dentro de World App<br />
          y con World ID verificado.
        </div>
        <div className="text-sm text-gray-400">
          Status detectado: {status || 'desconocido'}<br />
          Intentos de retry: {retryCount}
        </div>
        <button
          onClick={() => {
            setRetryCount(c => c + 1);
            setLoadTimeout(false);
            window.location.reload();
          }}
          className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg active:scale-95 transition-transform"
        >
          Reintentar detección
        </button>
      </div>
    );
  }

  // Verificando después de wallet detectada
  if (!verified) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Verificando World ID...<br />
        Wallet detectada: {walletAddress.slice(0, 6)}...
      </div>
    );
  }

  // Pantalla principal (éxito)
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="p-4 text-xl font-bold text-center">Human Feed</header>
      <main className="flex-1 overflow-auto p-4">
        <FeedPage wallet={walletAddress} />
      </main>
    </div>
  );
};

export default App;

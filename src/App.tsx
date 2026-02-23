import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { useMiniKitUser } from "./lib/useMiniKitUser";

const App: React.FC = () => {
  const { walletAddress, status, verifyOrb, isVerifying } = useMiniKitUser();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Debug para ver siempre el estado actual
  console.log('Estado actual:', { 
    status: status || 'sin status', 
    wallet: walletAddress ? walletAddress.slice(0,8) + '...' : 'sin wallet', 
    isVerifying, 
    verified 
  });

  useEffect(() => {
    const doVerify = async () => {
      if (status !== "found" || !walletAddress) return;

      setVerifying(true);
      try {
        console.log("Iniciando verificación con wallet:", walletAddress);
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

        const result = await res.json();
        if (result.success) {
          setVerified(true);
          console.log("Verificación OK");
        } else {
          console.error("Rechazado por backend:", result);
        }
      } catch (err) {
        console.error("Error en verify:", err);
      } finally {
        setVerifying(false);
      }
    };

    doVerify();
  }, [status, walletAddress, verifyOrb]);

  // Carga (incluye caso status undefined para evitar blanco total)
  if (!status || status === "initializing" || status === "polling" || isVerifying || verifying) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-4">
        Cargando World ID...  
        <br />
        Status: {status || 'cargando...'} 
      </div>
    );
  }

  // No detectado en World App o sin wallet
  if (!walletAddress || status === "not-installed" || status === "timeout") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Esta app solo funciona dentro de World App con World ID verificado.  
        <br /><br />
        Debug: status = {status || 'desconocido'}
      </div>
    );
  }

  // Verificando
  if (!verified) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Verificando World ID...  
        <br />
        Wallet detectada
      </div>
    );
  }

  // Pantalla principal
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

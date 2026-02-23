import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { useMiniKitUser } from "./lib/useMiniKitUser";

const App: React.FC = () => {
  const { walletAddress, status, verifyOrb, proof, isVerifying } = useMiniKitUser();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const doVerify = async () => {
      if (status !== "found" || !walletAddress) return;

      setVerifying(true);
      try {
        console.log("Intentando verify - walletAddress:", walletAddress);
        console.log("MiniKit status:", status);

        // Ejecuta la verificación Orb
        const orbProof = await verifyOrb("verify_user", walletAddress);

        // Enviar proof al backend (Supabase)
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
        } else {
          console.error("Proof invalid or backend rejected it", result.error);
        }
      } catch (err) {
        console.error("Verification failed", err);
      } finally {
        setVerifying(false);
      }
    };

    doVerify();
  }, [status, walletAddress, verifyOrb]);

  // Pantalla de carga
  if (status === "initializing" || status === "polling" || isVerifying) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Cargando World ID...
      </div>
    );
  }

  // Pantalla cuando no hay wallet o timeout
  if (!walletAddress || status === "not-installed" || status === "timeout") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Esta aplicación solo funciona dentro de World App y con World ID verificado.
      </div>
    );
  }

  // Pantalla principal cuando wallet y proof están listos
  if (!verified) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Verificando World ID...
      </div>
    );
  }

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

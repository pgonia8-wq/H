import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useMiniKitUser } from "./lib/useMiniKitUser";

const App: React.FC = () => {
  const { wallet, loading } = useMiniKitUser();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!wallet) {
        setVerifying(false);
        return;
      }

      try {
        // 1️⃣ Solicitar proof al usuario
        const { finalPayload } = await MiniKit.commandsAsync.verify({
          action: "verify_user", // acción de tu app
          signal: wallet,
          verification_level: VerificationLevel.Orb,
        });

        if (finalPayload.status !== "success") {
          console.error("User cancelled or error in verification");
          setVerifying(false);
          return;
        }

        // 2️⃣ Enviar proof al backend
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: finalPayload,
            action: "verify_user",
            signal: wallet,
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

    verify();
  }, [wallet]);

  if (loading || verifying) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Cargando...
      </div>
    );
  }

  if (!wallet || !verified) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Esta aplicación solo funciona dentro de World App y con World ID verificado.
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="p-4 text-xl font-bold text-center">Human Feed</header>
      <main className="flex-1 overflow-auto p-4">
        <FeedPage wallet={wallet} />
      </main>
    </div>
  );
};

export default App;

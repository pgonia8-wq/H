import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useMiniKitUser } from "./lib/useMiniKitUser";

const App: React.FC = () => {
  const { wallet, loading } = useMiniKitUser();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Debug constante en consola
  useEffect(() => {
    console.log("[App DEBUG] Render - wallet:", wallet, "loading:", loading, "verifying:", verifying);
    console.log("[App DEBUG] isInstalled:", MiniKit?.isInstalled?.() ?? false);
  }, [wallet, loading, verifying]);

  useEffect(() => {
    const verify = async () => {
      if (!wallet) {
        console.log("No wallet detectada → skip verify");
        setVerifying(false);
        return;
      }

      console.log("✅ Wallet OK → Iniciando verify (Device mode)");
      setVerifying(true);

      try {
        const { finalPayload } = await MiniKit.commandsAsync.verify({
          action: "verify_user",
          signal: wallet,
          verification_level: VerificationLevel.Device, // ← Cambiado a Device para pruebas rápidas
        });

        console.log("Verify finalPayload:", finalPayload);

        if (finalPayload.status !== "success") {
          console.error("User cancelled or error", finalPayload);
          setVerifying(false);
          return;
        }

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
          console.log("Backend verify OK → usuario verificado");
        } else {
          console.error("Backend rechazó proof", result.error);
        }
      } catch (err) {
        console.error("Verification failed:", err);
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
        <br /><br />
        <strong>DEBUG (pantalla negra):</strong><br />
        loading: {loading ? 'true' : 'false'}<br />
        verifying: {verifying ? 'true' : 'false'}<br />
        wallet: {wallet || 'null'}<br />
        MiniKit.isInstalled(): {MiniKit?.isInstalled?.() ?? false ? 'true' : 'false'}
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

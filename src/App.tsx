import React, { useEffect, useState } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import FeedPage from "./pages/FeedPage";

export default function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    MiniKit.install();

    if (!MiniKit.isInstalled()) {
      setError("MiniKit no detectado - abre desde World App");
      setLoading(false);
      return;
    }

    const checkWallet = () => {
      const w = MiniKit.walletAddress;
      if (w) {
        setWallet(w);
        setLoading(false);
        verify(); // inicia verificación automáticamente
      }
    };

    checkWallet();
    const interval = setInterval(checkWallet, 3000);

    setTimeout(() => {
      if (!wallet) {
        setError("No se pudo obtener wallet después de 60s");
        setLoading(false);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const verify = async () => {
    if (verifying || !wallet) return;

    setVerifying(true);
    setError(null);

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "verify-user",          // ← Tu action con guión medio
        signal: wallet,
        verification_level: VerificationLevel.Device, // Device para pruebas rápidas
      });

      if (finalPayload.status !== "success") {
        setError("Verificación cancelada o fallida");
        return;
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          action: "verify-user",
          signal: wallet,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setVerified(true);
      } else {
        setError("Backend rechazó el proof");
      }
    } catch (err) {
      setError("Error en verificación: " + (err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div style={{ background: 'black', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando wallet...</div>;
  }

  if (!wallet || !verified) {
    return (
      <div style={{ background: 'black', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        Esta aplicación solo funciona dentro de World App y con World ID verificado.
        <br /><br />
        <strong>DEBUG:</strong><br />
        Wallet: {wallet || 'null'}<br />
        isInstalled: {MiniKit.isInstalled() ? 'true' : 'false'}<br />
        Verifying: {verifying ? 'Sí' : 'No'}<br />
        Verified: {verified ? 'Sí' : 'No'}<br />
        Error: {error || 'Ninguno'}<br /><br />
        <button onClick={verify} style={{ padding: '12px 24px', fontSize: '18px', background: '#0066ff', color: 'white', border: 'none', borderRadius: '8px' }}>
          Verificar ahora
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'black', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Human Feed</header>
      <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <FeedPage wallet={wallet} />
      </main>
    </div>
  );
}

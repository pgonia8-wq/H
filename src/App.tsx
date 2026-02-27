import React, { useEffect, useState } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

export default function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    MiniKit.install();

    if (!MiniKit.isInstalled()) {
      setError("MiniKit no detectado - asegúrate de abrir desde World App");
      setLoading(false);
      return;
    }

    console.log("MiniKit detectado - iniciando chequeo de wallet");

    const checkWallet = () => {
      const w = MiniKit.walletAddress;
      if (w) {
        setWallet(w);
        setLoading(false);
        // Iniciar verificación automáticamente
        verify();
      }
    };

    checkWallet();
    const interval = setInterval(checkWallet, 3000); // cada 3 segundos

    // Timeout máximo para evitar loop eterno
    setTimeout(() => {
      if (!wallet) {
        setError("Timeout: no se pudo obtener wallet después de 60s");
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
        action: "verify-user", // ← TU ACTION CON GUIÓN MEDIO
        signal: wallet,
        verification_level: VerificationLevel.Device, // Cambia a Orb cuando quieras
      });

      if (finalPayload.status !== "success") {
        setError("Verificación cancelada o fallida por el usuario");
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
        setError("Backend rechazó la verificación");
      }
    } catch (err) {
      setError("Error durante verificación: " + (err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'black',
        color: 'white',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        Cargando wallet...
      </div>
    );
  }

  if (!wallet || !verified) {
    return (
      <div style={{
        background: 'black',
        color: 'white',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <p>Esta aplicación solo funciona dentro de World App y con World ID verificado.</p>
        
        <br />
        <strong>DEBUG ACTUAL:</strong>
        <p>Wallet: {wallet || 'null'}</p>
        <p>isInstalled: {MiniKit.isInstalled() ? 'true' : 'false'}</p>
        <p>Verificando: {verifying ? 'Sí' : 'No'}</p>
        <p>Verificado: {verified ? 'Sí' : 'No'}</p>
        <p>Error: {error || 'Ninguno'}</p>

        <br />
        <button 
          onClick={verify}
          disabled={verifying || !wallet}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            background: verifying || !wallet ? '#444' : '#0066ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            marginTop: '20px',
            cursor: verifying || !wallet ? 'not-allowed' : 'pointer'
          }}
        >
          {verifying ? 'Verificando...' : 'Verificar ahora'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'black', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
        Human Feed
      </header>
      <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <p>Wallet verificada: {wallet}</p>
        {/* Aquí irá tu FeedPage más adelante */}
        <p>¡Bienvenido! Ya estás verificado.</p>
      </main>
    </div>
  );
  }

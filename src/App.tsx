import React, { useEffect, useState } from "react";
import FeedPage from "./pages/FeedPage";
import { useMiniKitUser } from "./lib/useMiniKitUser";

const App: React.FC = () => {
  const { walletAddress, status, verifyOrb, isVerifying } = useMiniKitUser();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [backendResult, setBackendResult] = useState<string | null>(null);

  // Verificación cuando wallet está lista
  useEffect(() => {
    if (status !== "found" || !walletAddress || verified) return;

    const doVerify = async () => {
      setVerifying(true);
      setBackendResult(null);

      try {
        console.log("Iniciando verificación");
        const orbProof = await verifyOrb("verifica-que-eres-humano", walletAddress);

        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: orbProof,
            action: "verifica-que-eres-humano",
            signal: walletAddress,
          }),
        });

        const result = await res.json();
        console.log("Resultado backend:", result);

        if (result.success) {
          setVerified(true);
          setBackendResult("✅ Verificado correctamente");
        } else {
          setBackendResult("❌ Backend rechazó el proof");
        }
      } catch (err: any) {
        console.error("Error verificación:", err);
        setBackendResult(`❌ Error: ${err.message}`);
      } finally {
        setVerifying(false);
      }
    };

    doVerify();
  }, [status, walletAddress, verified, verifyOrb]);

  // Pantalla de carga / estados
  if (!status || status === "initializing" || status === "polling" || isVerifying || verifying) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Cargando World ID...<br />
        Status: {status || "esperando"}<br />
        Wallet: {walletAddress || "sin wallet"}<br />
        Verificando: {verifying ? "Sí" : "No"}
      </div>
    );
  }

  // Error o no detectado
  if (!walletAddress || status === "not-installed" || status === "timeout" || status === "error") {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6 gap-6">
        <div className="text-xl font-bold">
          Esta aplicación solo funciona dentro de World App y con World ID verificado.
        </div>
        <div className="text-sm text-gray-400">
          Status: {status || "desconocido"}<br />
          Wallet: {walletAddress || "sin wallet"}
        </div>
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

      {/* 🔹 Panel de debug en pantalla */}
      <div className="fixed bottom-0 left-0 w-full bg-black bg-opacity-90 text-white p-2 text-xs z-50 flex flex-col gap-1">
        <div>Status: {status}</div>
        <div>Wallet: {walletAddress}</div>
        <div>Verificando Orb: {verifying ? "Sí" : "No"}</div>
        <div>Verificado: {verified ? "✅ Sí" : "❌ No"}</div>
        <div>Backend: {backendResult || "esperando..."}</div>
      </div>
    </div>
  );
};

export default App;

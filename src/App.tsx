import { useState, useEffect } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import HomePage from "./pages/HomePage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [verified, setVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log("[APP] userId desde localStorage:", storedUserId);
    if (storedUserId) {
      setUserId(storedUserId);
      setVerified(true);
      console.log("[APP] Usuario ya verificado");
    }
  }, []);

  const handleVerify = async () => {
    try {
      setError(null);
      setMessage("Verificando con H…");
      console.log("[APP] Iniciando MiniKit verify");

      if (!MiniKit.isInstalled()) {
        setError("World App no detectada");
        console.log("[APP] MiniKit no detectado");
        return;
      }

      const verifyRes = await MiniKit.commandsAsync.verify({
        action: "verify-user",
        verification_level: VerificationLevel.Device,
      });

      console.log("[APP] Resultado verify:", verifyRes);

      const proofData = verifyRes?.finalPayload?.proof;
      if (!proofData) {
        setError("No se encontró proof válido");
        console.log("[APP] proofData no existe");
        return;
      }

      const id = proofData.nullifier_hash;
      console.log("[APP] nullifier_hash obtenido:", id);

      const body = {
        proof: proofData.proof,
        merkle_root: proofData.merkle_root,
        nullifier_hash: proofData.nullifier_hash,
        verification_level: proofData.verification_level,
        action: "verify-user",
        max_age: 7200,
      };

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      console.log("[APP] Respuesta backend /api/verify:", result);

      if (result.success) {
        setVerified(true);
        setUserId(id);
        localStorage.setItem('userId', id);
        setMessage("✅ Verificación exitosa");
        console.log("[APP] Usuario verificado y guardado:", id);
      } else {
        setError("Backend rechazó la prueba: " + (result.error || ""));
        console.log("[APP] Backend rechazó la prueba:", result.error);
      }
    } catch (err: any) {
      setError("Error durante verificación: " + err.message);
      console.log("[APP] Error catch:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {!verified || !userId ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center w-full max-w-md">
          <img src="/logo.png" alt="Logo H" className="w-40 h-40 rounded-full mb-6 shadow-lg object-contain" />
          <p className="text-black text-2xl font-bold mb-6 text-center">Verificando con H…</p>
          <button onClick={handleVerify} className="px-8 py-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition">
            Iniciar verificación
          </button>
          {message && <p className="mt-4 text-gray-700">{message}</p>}
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
      ) : (
        <ErrorBoundary>
          <HomePage userId={userId} />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;

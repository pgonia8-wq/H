import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function App() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      MiniKit.install();
      const installed = MiniKit.isInstalled();
      console.log("MiniKit installed:", installed);
      setIsInstalled(installed);
    } catch (err) {
      console.error("MiniKit install error:", err);
    }
  }, []);

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      alert("MiniKit no está disponible");
      return;
    }

    try {
      setLoading(true);
      setMessage("Abriendo verificación...");

      const verifyRes = await MiniKit.commandsAsync.verify({
        action: "verify-user",
      });

      console.log("Verify response:", verifyRes);

      const proof = verifyRes?.finalPayload;

      if (!proof) {
        throw new Error("No se recibió proof");
      }

      const backendRes = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proof }),
      });

      const backend = await backendRes.json();
      console.log("Backend response:", backend);

      if (backend.success) {
        setMessage("✅ Verificación exitosa");
      } else {
        setMessage("❌ Backend rechazó la prueba");
      }

    } catch (err) {
      console.error("Verify error:", err);
      setMessage("❌ Error durante verificación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Human App</h1>

      <p>
        MiniKit instalado: {isInstalled ? "✅ Sí" : "❌ No"}
      </p>

      <button
        onClick={handleVerify}
        disabled={!isInstalled || loading}
        style={{
          padding: "12px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#000",
          color: "#fff",
          cursor: "pointer",
          marginTop: 10
        }}
      >
        {loading ? "Verificando..." : "Verificar con World ID"}
      </button>

      {message && (
        <p style={{ marginTop: 20 }}>
          {message}
        </p>
      )}
    </div>
  );
}

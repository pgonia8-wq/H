import { useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { supabase } from "./supabaseClients";

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const init = async () => {
      try {
        // Inicializa MiniKit
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("❌ No estás dentro de World App");
          setWallet(null);
          setLoading(false);
          return;
        }

        const checkWallet = async () => {
          const userWallet = await MiniKit.commandsAsync.getWallet();

          if (userWallet) {
            console.log("✅ Wallet detectada:", userWallet);
            setWallet(userWallet);

            // Guardar en Supabase si hay sesión
            const user = supabase.auth.user();
            if (user) {
              await supabase
                .from("users")
                .upsert({ id: user.id, wallet: userWallet });
            }

            // Wallet ya obtenida → detiene polling
            if (interval) clearInterval(interval);
            setLoading(false);
          } else {
            console.log("⚠️ Wallet todavía no disponible, reintentando...");
          }
        };

        // Primera comprobación inmediata
        await checkWallet();

        // Polling cada 3s hasta obtener wallet
        interval = setInterval(checkWallet, 3000);

        // Timeout visible si no carga después de 60s
        setTimeout(() => {
          if (!wallet) {
            console.log("[Timeout] Wallet no cargó después de 60s");
          }
        }, 60000);

      } catch (err) {
        console.error("Error en init MiniKit:", err);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return { wallet, loading };
};

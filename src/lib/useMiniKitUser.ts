import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { supabase } from './supabaseClients';

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

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

        // Función que revisa si wallet ya está disponible
        const checkWallet = async () => {
          const userWallet = MiniKit.walletAddress;

          if (userWallet) {
            console.log("✅ Wallet detectada:", userWallet);
            setWallet(userWallet);

            // Guardar en Supabase si hay sesión
            const user = supabase.auth.user();
            if (user) {
              await supabase
                .from('users')
                .upsert({ id: user.id, wallet: userWallet });
            }

            // Wallet encontrada, limpiar interval y timeout
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
            setLoading(false);
          } else {
            console.log("⚠️ MiniKit instalado pero wallet null, reintentando...");
          }
        };

        // Revisar una vez al inicio
        await checkWallet();

        // Reintentar cada 3s si aún no hay wallet
        interval = setInterval(checkWallet, 3000);

        // Timeout visible a los 60s
        timeout = setTimeout(() => {
          if (!wallet) {
            console.warn("[Timeout] Wallet no cargó después de 60s");
            setLoading(false);
          }
        }, 60000);

      } catch (err) {
        console.error("Error en init MiniKit:", err);
        setLoading(false);
      }
    };

    init();

    // Cleanup
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return { wallet, loading };
};

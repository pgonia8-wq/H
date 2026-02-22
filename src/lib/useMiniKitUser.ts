import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { supabase } from './supabaseClients';

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const init = async () => {
      console.log("[MiniKitUser] Iniciando MiniKit...");
      try {
        MiniKit.install();
        console.log("[MiniKitUser] MiniKit.install() llamado");

        if (!MiniKit.isInstalled()) {
          console.log("❌ No estás dentro de World App o MiniKit no está disponible");
          setWallet(null);
          setLoading(false);
          return;
        }

        console.log("✅ MiniKit detectado. Wallet inicial:", MiniKit.walletAddress);

        const checkWallet = async () => {
          const userWallet = MiniKit.walletAddress;
          console.log("[CheckWallet] Wallet actual:", userWallet);

          if (userWallet) {
            console.log("✅ Wallet detectada:", userWallet);
            setWallet(userWallet);

            // Guardar en Supabase si hay sesión
            const user = supabase.auth.user();
            if (user) {
              console.log("[CheckWallet] Guardando wallet en Supabase para user:", user.id);
              await supabase
                .from('users')
                .upsert({ id: user.id, wallet: userWallet });
            }

            if (interval) clearInterval(interval);
            console.log("[CheckWallet] Interval cleared, loading false");
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
      if (interval) {
        clearInterval(interval);
        console.log("[Cleanup] Interval limpiado");
      }
    };
  }, [wallet]);

  return { wallet, loading };
};

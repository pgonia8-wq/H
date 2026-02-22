import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { supabase } from './supabaseClients';

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const init = async () => {
      try {
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("❌ No estás dentro de World App");
          setWallet(null);
          setLoading(false);
          return;
        }

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

            if (interval) clearInterval(interval);
            setLoading(false);
          } else {
            console.log("⚠️ MiniKit instalado pero wallet null, reintentando...");
          }
        };

        // Revisar una vez al inicio
        await checkWallet();

        // Reintentar cada 3s si aún no hay wallet
        interval = setInterval(checkWallet, 3000);
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

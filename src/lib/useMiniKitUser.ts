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
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("❌ No estás dentro de World App");
          setLoading(false);
          return;
        }

        const checkWallet = async () => {
          try {
            const userWallet = await MiniKit.commandsAsync.getWallet?.();
            if (userWallet) {
              console.log("✅ Wallet detectada:", userWallet);
              setWallet(userWallet);

              const user = supabase.auth.user();
              if (user) {
                await supabase
                  .from('users')
                  .upsert({ id: user.id, wallet: userWallet });
              }

              if (interval) clearInterval(interval);
              if (timeout) clearTimeout(timeout);
              setLoading(false);
            } else {
              console.log("⚠️ Wallet aún null, reintentando...");
            }
          } catch (err) {
            console.error("Error al obtener wallet con commandsAsync.getWallet():", err);
          }
        };

        // Primer intento
        await checkWallet();

        // Polling cada 3s
        interval = setInterval(checkWallet, 3000);

        // Timeout visible a 60s
        timeout = setTimeout(() => {
          if (!wallet) console.warn("[Timeout] Wallet no cargó después de 60s");
          setLoading(false);
        }, 60000);

      } catch (err) {
        console.error("Error init MiniKit:", err);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return { wallet, loading };
};

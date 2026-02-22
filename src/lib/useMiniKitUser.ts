import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { supabase } from './supabaseClients';

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const init = async () => {
      try {
        // Inicializa explícitamente (MiniKitProvider ya lo hace, pero por seguridad)
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("❌ MiniKit.isInstalled() = false → No estás dentro de World App o hay delay inicial");
          setWallet(null);
          setLoading(false);
          return;
        }

        console.log("MiniKit.isInstalled() = true → Entorno World App detectado");

        const checkWallet = () => {
          // Forma recomendada 2026: walletAddress directo o desde user
          const userWallet = MiniKit.walletAddress || MiniKit.user?.walletAddress || null;

          if (userWallet) {
            console.log("✅ Wallet detectada:", userWallet);
            setWallet(userWallet);

            // Guardar en Supabase si hay sesión activa
            const user = supabase.auth.user();
            if (user) {
              supabase
                .from('users')
                .upsert({ id: user.id, wallet: userWallet })
                .then(({ error }) => {
                  if (error) console.error("Error upsert wallet en Supabase:", error);
                });
            }

            if (interval) clearInterval(interval);
            setLoading(false);
          } else {
            console.log("⚠️ Wallet aún null → reintentando en 3s...");
          }
        };

        // Chequeo inicial
        checkWallet();

        // Polling cada 3 segundos (máximo \~30s antes de rendirse, pero puedes ajustar)
        interval = setInterval(checkWallet, 3000);

        // Cleanup
        return () => {
          if (interval) clearInterval(interval);
        };
      } catch (err) {
        console.error("Error grave en init MiniKit:", err);
        setLoading(false);
      }
    };

    init();
  }, []);

  return { wallet, loading };
};

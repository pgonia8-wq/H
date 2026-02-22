import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { supabase } from './supabaseClients';   // ← el que usas (el de lib)

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // ← ESTO ES OBLIGATORIO (lo hace el Provider internamente)
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("❌ No estás dentro de World App");
          setWallet(null);
          setLoading(false);
          return;
        }

        // ← NUEVA FORMA CORRECTA de obtener la wallet (2026)
        const userWallet = MiniKit.walletAddress;

        if (userWallet) {
          console.log("✅ Wallet detectada:", userWallet);
          setWallet(userWallet);

          // Opcional: guardar en Supabase (si tienes sesión)
          const user = supabase.auth.user();
          if (user) {
            await supabase
              .from('users')
              .upsert({ id: user.id, wallet: userWallet });
          }
        } else {
          console.log("⚠️ MiniKit instalado pero wallet null");
        }
      } catch (err) {
        console.error("Error en init MiniKit:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return { wallet, loading };
};

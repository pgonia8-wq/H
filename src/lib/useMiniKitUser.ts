import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const init = async () => {
      try {
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("[MiniKit] ❌ No estás dentro de World App");
          setWallet(null);
          setLoading(false);
          return;
        }

        console.log("[MiniKit] ✅ Entorno World App detectado");

        const checkWallet = () => {
          const userWallet = MiniKit.walletAddress || (window as any).MiniKit?.walletAddress || null;

          console.log("[MiniKit] Chequeando wallet:", userWallet ? userWallet : "null");

          if (userWallet) {
            console.log("[MiniKit] Wallet DETECTADA:", userWallet);
            setWallet(userWallet);
            if (interval) clearInterval(interval);
            setLoading(false);
          }
        };

        checkWallet();
        interval = setInterval(checkWallet, 2000); // cada 2s

        // Timeout de seguridad
        setTimeout(() => {
          if (!wallet) {
            console.log("[MiniKit] Timeout: wallet no cargó después de 45s");
            setLoading(false);
          }
        }, 45000);

      } catch (err) {
        console.error("[MiniKit] Error grave:", err);
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

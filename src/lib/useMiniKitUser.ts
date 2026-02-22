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
        console.log('[MiniKit-DEBUG] Iniciando init...');

        // Instala explícitamente
        MiniKit.install();
        console.log('[MiniKit-DEBUG] install() llamado');

        // Chequea isInstalled inmediatamente
        const isInstalled = MiniKit.isInstalled();
        console.log('[MiniKit-DEBUG] isInstalled inmediato:', isInstalled);

        // Fallback a window si provider no expuso bien
        const windowMiniKit = (window as any).MiniKit;
        const windowInstalled = windowMiniKit?.isInstalled?.() ?? false;
        console.log('[MiniKit-DEBUG] window.MiniKit.isInstalled:', windowInstalled);

        if (!isInstalled && !windowInstalled) {
          console.log('[MiniKit-DEBUG] ❌ No detectado entorno World App');
          setWallet(null);
          setLoading(false);
          return;
        }

        console.log('[MiniKit-DEBUG] Entorno detectado (uno de los chequeos OK)');

        const checkWallet = () => {
          let userWallet =
            MiniKit.walletAddress ||
            windowMiniKit?.walletAddress ||
            null;

          console.log('[MiniKit-DEBUG] Chequeo wallet:', userWallet ?? 'null');

          if (userWallet) {
            console.log('[MiniKit-DEBUG] Wallet DETECTADA:', userWallet);
            setWallet(userWallet);

            const user = supabase.auth.user();
            if (user) {
              supabase
                .from('users')
                .upsert({ id: user.id, wallet: userWallet })
                .then(({ error }) => error && console.error('Upsert error:', error));
            }

            if (interval) clearInterval(interval);
            setLoading(false);
          }
        };

        checkWallet();
        interval = setInterval(checkWallet, 1500); // chequeo más frecuente para debug

        return () => {
          if (interval) clearInterval(interval);
        };
      } catch (err) {
        console.error('[MiniKit-DEBUG] Error en init:', err);
        setLoading(false);
      }
    };

    init();
  }, []);

  return { wallet, loading };
};

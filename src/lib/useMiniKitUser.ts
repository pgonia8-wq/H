import { useState, useEffect } from 'react';
import { supabase } from './supabaseClients';

// Declaramos MiniKit global (World App lo inyecta)
declare var MiniKit: any;

export type MiniKitStatus =
  | 'initializing'
  | 'not-installed'
  | 'polling'
  | 'found'
  | 'timeout'
  | 'error';

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<MiniKitStatus>('initializing');
  const [proof, setProof] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    const init = async () => {
      try {
        // Inicializa MiniKit (Provider ya lo hace, pero reforzamos)
        MiniKit.install();

        if (!MiniKit.isInstalled()) {
          console.log("❌ MiniKit no instalado, sal del navegador o World App?");
          setStatus('not-installed');
          setWallet(null);
          return;
        }

        setStatus('polling');

        const pollWallet = async () => {
          try {
            const res = await MiniKit.commandsAsync.getWallet();
            const userWallet = res?.wallet ?? null;
            console.log('[Poll] MiniKit.getWallet ->', userWallet);

            if (userWallet && isMounted) {
              setWallet(userWallet);
              setStatus('found');
              clearInterval(interval);
              clearTimeout(timeoutId);

              // Guardar wallet en Supabase si hay sesión
              const user = supabase.auth.user();
              if (user) {
                await supabase
                  .from('users')
                  .upsert({ id: user.id, wallet: userWallet });
                console.log('[Supabase] Wallet guardada:', userWallet);
              }
            }
          } catch (err) {
            console.error('[MiniKit] Error polling wallet:', err);
          }
        };

        // Primer chequeo inmediato
        await pollWallet();

        // Polling cada 3 segundos
        interval = setInterval(pollWallet, 3000);

        // Timeout visible a los 60s
        timeoutId = setTimeout(() => {
          if (!wallet && isMounted) {
            console.warn('[Timeout] Wallet no cargó después de 60s');
            setStatus('timeout');
            clearInterval(interval);
          }
        }, 60000);
      } catch (err) {
        console.error('[MiniKit] Error en init:', err);
        setStatus('error');
      }
    };

    init();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Función para ejecutar la verificación Orb
  const verifyOrb = async (action = 'verify_user', signal?: string) => {
    if (!wallet) throw new Error('Wallet aún no disponible');
    setIsVerifying(true);
    try {
      if (!MiniKit?.commandsAsync?.verify) throw new Error('MiniKit.commandsAsync.verify no disponible');
      const result = await MiniKit.commandsAsync.verify({
        action,
        signal: signal || wallet,
      });
      if (result?.status === 'success') {
        setProof(result.proof);
        console.log('[MiniKit] Verificación exitosa', result.proof);
        return result.proof;
      } else {
        throw new Error('Verificación fallida o cancelada');
      }
    } catch (err) {
      console.error('[MiniKit] verifyOrb error:', err);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  return { wallet, status, proof, verifyOrb, isVerifying };
};

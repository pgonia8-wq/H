import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Declaramos MiniKit de forma global ya que World App lo inyecta en window
declare var MiniKit: any;

export type MiniKitStatus = 
  | 'initializing' 
  | 'not-installed' 
  | 'polling' 
  | 'found' 
  | 'timeout' 
  | 'error';

export function useMiniKitUser() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<MiniKitStatus>('initializing');
  const [proof, setProof] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const queryClient = useQueryClient();

  // Integración para guardar en la base de datos (Supabase / Backend)
  const updateWalletMutation = useMutation({
    mutationFn: async (wallet: string) => {
      // Aquí puedes agregar tu token de sesión de Supabase en los headers si llamas a un backend propio,
      // o utilizar directamente el cliente de supabase (ej: supabase.from('users').update({ wallet }).eq(...))
      const res = await fetch('/api/users/wallet', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${supabaseSessionToken}` // ← Agregar si usas JWT de Supabase
        },
        body: JSON.stringify({ wallet }),
      });
      
      if (!res.ok) {
        throw new Error('Error al actualizar la wallet en Supabase/BD');
      }
      return res.json();
    },
    onSuccess: () => {
      console.log('Wallet guardada exitosamente en la base de datos');
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    },
    onError: (err) => {
      console.error('Error guardando la wallet:', err);
    }
  });

  useEffect(() => {
    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    const initMiniKit = async () => {
      try {
        // 1. Detectar si MiniKit está instalado
        if (typeof MiniKit === 'undefined' || !MiniKit.isInstalled()) {
          if (isMounted) setStatus('not-installed');
          return;
        }

        if (isMounted) setStatus('polling');

        // 2. Polling cada 3 segundos
        const pollForWallet = async () => {
          try {
            const res = await MiniKit.commandsAsync.getWallet();
            if (res?.wallet && isMounted) {
              setWalletAddress(res.wallet);
              setStatus('found');
              clearInterval(pollInterval);
              clearTimeout(timeoutId);
              
              // 3. Si hay wallet, guardarla en Supabase/Backend
              updateWalletMutation.mutate(res.wallet);
            }
          } catch (e) {
            console.error('[MiniKit] Error obteniendo la wallet:', e);
            // Si hay un error transitorio, sigue intentando hasta el timeout.
          }
        };

        pollInterval = setInterval(pollForWallet, 3000);
        pollForWallet(); // Ejecutar inmediatamente la primera vez

        // 4. Timeout visible de 60 segundos
        timeoutId = setTimeout(() => {
          if (isMounted && status !== 'found') {
            clearInterval(pollInterval);
            setStatus('timeout');
          }
        }, 60000);

      } catch (error) {
        console.error('[MiniKit] Error en inicialización:', error);
        if (isMounted) setStatus('error');
      }
    };

    initMiniKit();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 5. Permite ejecutar verificación Orb y capturar el proof
  const verifyOrb = async (action: string = 'test-action', signal: string = 'test-signal') => {
    setIsVerifying(true);
    try {
      if (typeof MiniKit === 'undefined') {
        throw new Error('MiniKit no está instalado en este entorno');
      }

      const response = await MiniKit.commandsAsync.verify({ action, signal });

      if (response?.status === 'success' && response?.proof) {
        setProof(response.proof);
        return response.proof;
      } else {
        throw new Error('La verificación no fue exitosa o fue cancelada por el usuario.');
      }
    } catch (error: any) {
      console.error('[MiniKit] Error en verificación Orb:', error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    walletAddress,
    status,
    proof,
    verifyOrb,
    isVerifying,
    isSavingWallet: updateWalletMutation.isPending,
  };
}

import { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

type StatusType = 'initializing' | 'not-installed' | 'polling' | 'wallet-found' | 'error' | 'verified';

export const useMiniKitUser = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusType>('initializing');
  const [proof, setProof] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!MiniKit.isInstalled()) {
        setStatus('not-installed');
        return;
      }

      setStatus('polling');

      try {
        // Pequeño buffer para que el bridge esté completamente listo
        await new Promise(resolve => setTimeout(resolve, 1500));

        const wallet = await MiniKit.commandsAsync.getWallet();
        if (wallet?.address) {
          setWalletAddress(wallet.address);
          setStatus('wallet-found');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error al obtener wallet:', error);
        setStatus('error');
      }
    };

    initialize();
  }, []);

  const verifyOrb = async (action: string, signal: string) => {
    if (isVerifying) return null;
    setIsVerifying(true);

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action,
        signal,
      });

      setProof(finalPayload);
      setStatus('verified');
      return finalPayload;
    } catch (error) {
      console.error('Error en verifyOrb:', error);
      setStatus('error');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    walletAddress,
    status,
    verifyOrb,
    proof,
    isVerifying,
  };
};

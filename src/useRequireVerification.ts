import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export const useRequireVerification = () => {
  const [verified, setVerified] = useState(false);

  const requireVerification = async () => {
    if (!MiniKit.isInstalled()) {
      alert('Abre esta mini app dentro de World App para verificar tu identidad.');
      return;
    }

    try {
      const response = await MiniKit.commandsAsync.verify({
        action: 'verify_user',
        signal: 'user_signal',
        verification_level: 'Orb', // o VerificationLevel.Orb si lo importas
      });

      if (response?.status === 'success') {
        setVerified(true);
      } else {
        setVerified(false);
        console.warn('Verificación fallida o cancelada por el usuario');
      }
    } catch (err) {
      console.error('Error durante la verificación:', err);
      setVerified(false);
    }
  };

  return { verified, requireVerification };
};

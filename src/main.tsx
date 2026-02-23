import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MiniKit } from '@worldcoin/minikit-js';

const Root = () => {
  useEffect(() => {
    MiniKit.install();
    // Debug importante: esto te dice si realmente está dentro de World App
    console.log('MiniKit instalado:', MiniKit.isInstalled());
    if (MiniKit.isInstalled()) {
      console.log('¡Estás dentro de World App! El bridge está activo.');
    } else {
      console.log('No detectado como World App (normal si abres en navegador).');
    }
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

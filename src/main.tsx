import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MiniKit } from '@worldcoin/minikit-js';

// Instala MiniKit UNA SOLA VEZ, lo más temprano posible (fuera de useEffect y StrictMode)
MiniKit.install('app_6a98c88249208506dcd4e04b529111fc');

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Quitamos StrictMode temporalmente para evitar double install
  // Puedes probar agregarlo de nuevo después si todo funciona
  <App />
);

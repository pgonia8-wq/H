import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MiniKit } from '@worldcoin/minikit-js';

// Instala MiniKit UNA SOLA VEZ, lo más temprano posible (fuera de useEffect y componentes)
MiniKit.install();  // Si tu app ID es necesario, ponlo aquí: MiniKit.install('tu-app-id-aqui')

// Render directo SIN StrictMode para evitar double-init y white screen
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

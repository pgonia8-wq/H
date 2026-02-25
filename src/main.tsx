import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MiniKit } from '@worldcoin/minikit-js';

// Instala MiniKit UNA SOLA VEZ, inmediatamente al cargar
MiniKit.install();  // Si tienes ID específico: MiniKit.install('app_6a98c88249208506dcd4e04b529111fc')

// Render directo SIN StrictMode para evitar white screen
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

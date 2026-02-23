import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MiniAppProvider } from '@worldcoin/minikit-js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MiniAppProvider appId="app_18e24371c2f0aeaa6348745bf40add01">
      <App />
    </MiniAppProvider>
  </React.StrictMode>,
);

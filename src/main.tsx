import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MiniKit } from '@worldcoin/minikit-js';

const Root = () => {
  useEffect(() => {
    MiniKit.install('app_6a98c88249208506dcd4e04b529111fc');
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

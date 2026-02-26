import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Versión mínima sin Provider temporalmente (para descartar crash)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

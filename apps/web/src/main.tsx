import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { LanguageProvider } from './i18n/LanguageContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);

import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18next from "i18next";
import { LanguageProvider } from './Hoc/LanguageContext';
import { BrowserRouter } from 'react-router-dom';
i18next.init({
    interpolation: { escapeValue: false },  
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <I18nextProvider i18n={i18next}>
      <LanguageProvider >
        <BrowserRouter>
      <App />

        </BrowserRouter>
      </LanguageProvider>
       
      </I18nextProvider>
  </StrictMode>,
)

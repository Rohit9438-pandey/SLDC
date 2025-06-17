import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18next from "i18next";
import { LanguageProvider } from './Hoc/LanguageContext';
import { BrowserRouter } from 'react-router-dom';
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';          // core css
import 'primeicons/primeicons.css';                        // icons
import 'primeflex/primeflex.css';                          // optional flex grid


i18next.init({
    interpolation: { escapeValue: false },  
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <I18nextProvider i18n={i18next}>
      <LanguageProvider >
        <BrowserRouter basename={"/sldc-new"}>
      <App />

        </BrowserRouter>
      </LanguageProvider>
       
      </I18nextProvider>
  </StrictMode>,
)

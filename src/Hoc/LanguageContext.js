
import React, { createContext, useState, useContext ,useEffect } from 'react';
import en from '../locale/en/en.json';
import hi from '../locale/hi/hi.json';

const LanguageContext = createContext();


export const useLanguage = () => useContext(LanguageContext);


export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [ translations,setTranslations] = useState(en); 





  // Function to toggle between languages
  const toggleLanguage = () => {
    if (language === 'en') {
      setLanguage('hi');
      setTranslations(hi); // Set translations to Hindi
    } else {
      setLanguage('en');
      setTranslations(en); // Set translations to English
    }
  };
  useEffect(() => {
    // Update translations when language changes
    if (language === 'en') {
      setTranslations(en);
    } else {
      setTranslations(hi);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};
import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; 
import en from '../locale/en/en.json'; 
import hi from '../locale/hi/hi.json'; 

const About = () => {
  const { language } = useLanguage(); // Get current language from context

  // Select the appropriate translations based on the current language
  const translations = language === 'en' ? en : hi;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{translations.aboutTitle}</h1>
      <p className="text-lg text-gray-700 mb-6">
        {translations.intro}
      </p>
      <p className="text-lg text-gray-700 mb-6">
        {translations.slcIntro}
      </p>

      <h2 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Major Functions & Services of SLDC</h2>
      <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
        {translations.slcFunctions.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <div className="disclaimer mt-8 text-lg text-gray-700">
        <p>
          <strong>Disclaimer:</strong> {translations.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default About;

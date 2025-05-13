import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; 
import en from '../locale/en/en.json'; 
import hi from '../locale/hi/hi.json'; 
import { FaRegLightbulb, FaRegCheckCircle } from 'react-icons/fa'; // Icons for better visual appeal

const About = () => {
  const { language } = useLanguage(); 

  // Select the appropriate translations based on the current language
  const translations = language === 'en' ? en : hi;

  return (
    <div className="p-10 bg-gradient-to-r from-indigo-100 via-purple-200 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-4">
          {translations.aboutTitle}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          {translations.intro}
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          {translations.slcIntro}
        </p>

        <h2 className="text-3xl font-semibold text-indigo-800 mt-8 mb-6">
          Major Functions & Services of SLDC
        </h2>
        <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
          {translations.slcFunctions.map((item, index) => (
            <li key={index} className="flex items-start space-x-2 hover:bg-indigo-50 p-2 rounded-lg transition-all duration-200">
              <FaRegCheckCircle className="text-indigo-600 mt-1" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="disclaimer mt-8 text-lg text-gray-700">
        
          <p>
            <strong>Disclaimer:</strong> {translations.disclaimer}
            </p>
        </div>
      </div>
    </div>
  );
};

export default About;

import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext';
import en from '../locale/en/en.json';
import hi from '../locale/hi/hi.json';
import { FaRegLightbulb, FaRegCheckCircle } from 'react-icons/fa';

const About = () => {
  const { language } = useLanguage();
  
  // Select the appropriate translations based on the current language
  const translations = language === 'en' ? en : hi;

  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">
          {translations.aboutTitle}
        </h1>
        <p className="about-text">
          {translations.intro}
        </p>
        <p className="about-text">
          {translations.slcIntro}
        </p>

        <h2 className="functions-title">
          Major Functions & Services of SLDC
        </h2>
        <ul className="functions-list">
          {translations.slcFunctions.map((item, index) => (
            <li key={index} className="function-item">
              <FaRegCheckCircle className="function-icon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="disclaimer">
          <p>
            <strong>Disclaimer:</strong> {translations.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
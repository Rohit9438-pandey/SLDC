import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; // Import useLanguage hook
import en from '../locale/en/en.json'; // Import English translations
import hi from '../locale/hi/hi.json'; // Import Hindi translations

const Contact = () => {
  const { language } = useLanguage(); // Get the current language from the context

  // Select the appropriate translations based on the current language
  const translations = language === 'en' ? en : hi;

  return (
    <div className="contact-container p-8">
      <h2 className="contact-title text-4xl font-bold text-gray-800 mb-4">{translations.contactTitle}</h2>
      <div className="contact-info">
        <h3>{translations.companyName}</h3>
        <p>{translations.companyDescription}</p>
        <p>{translations.address1}</p>
        <p>{translations.address2}</p>
        <h3>{translations.sldcName}</h3>
        <p>{translations.address3}</p>
        <p>{translations.address4}</p>
        <p>{translations.address5}</p>
        <p>{translations.address6}</p>
        <p>{translations.phone}</p>
        <p>{translations.fax}</p>

        <div className="disclaimer mt-8 text-lg text-gray-700">
          <p>
            <strong>Disclaimer:</strong> {translations.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; // Import the useLanguage hook
import en from '../locale/en/en.json'; // Import English translations
import hi from '../locale/hi/hi.json'; // Import Hindi translations

const Feedback = () => {
  const { language } = useLanguage(); // Get the current language from context

  // Select the appropriate translations based on the current language
  const translations = language === 'en' ? en : hi;

  const [captcha, setCaptcha] = useState('');

  // Function to generate a random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captchaString = '';
    for (let i = 0; i < 6; i++) {
      captchaString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(captchaString);
  };

  useEffect(() => {
    generateCaptcha(); // Generate a new captcha on component mount
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert('Feedback submitted!'); // Placeholder for submission logic
    generateCaptcha(); // Generate a new captcha after submission
  };

  return (
    <div className="feedback-container p-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">{translations.feedbackTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label>{translations.nameLabel}</label>
          <input type="text" required className="form-input" />
        </div>
        <div className="form-group mb-4">
          <label>{translations.emailLabel}</label>
          <input type="email" required className="form-input" />
        </div>
        <div className="form-group mb-4">
          <label>{translations.commentsLabel}</label>
          <textarea required className="form-textarea" />
        </div>
        <div className="form-group mb-4">
          <label>{translations.captchaLabel}: {captcha}</label>
          <input type="text" required className="form-input" />
        </div>
        <button type="submit" className="submit-button bg-blue-500 text-white p-2 rounded">{translations.submitButton}</button>
      </form>

      <div className="disclaimer mt-8 text-lg text-gray-700">
        <p>
          <strong>Disclaimer:</strong> {translations.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default Feedback;

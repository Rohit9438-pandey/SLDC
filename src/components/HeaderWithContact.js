import React from 'react';
import myImage from '../assets/image.jfif';
import { useLanguage } from '../Hoc/LanguageContext';

const HeaderWithContact = () => {
  const { translations } = useLanguage();

  return (
    <header className="header-contact">
      <div className="contact-left">
        <img src={myImage} alt="Logo" className="image" />
        <div className="text-container">
          <span className="state-name highlighted-name">{translations.stateName}</span>
          <span className="sub-title">{translations.subTitle2}</span>
          <span className="sub-title font-bold">{translations.isoCertification}</span>
        </div>
      </div>

      <div className="contact-right">
        <div className="contact-item">
          <i className="fas fa-phone-alt"></i>
          <span>{translations.contactNo}:</span>
          <a href="tel:+91352645768">{translations.phoneNumbers}</a>
        </div>
        <div className="contact-item">
          <i className="fas fa-envelope"></i>
          <span>{translations.emailUs}:</span>
          <a href="mailto:info@uksldc.in">{translations.emailAddress}</a>
        </div>
      </div>
    </header>
  );
};

export default HeaderWithContact;

import React from 'react';
import myImage from '../assets/image.jfif'; 
import { useLanguage } from '../Hoc/LanguageContext'; // Import the context hook

const HeaderWithContact = () => {
  const { translations } = useLanguage(); // Get translations from context

  return (
    <header className="header-contact">
      <div className="contact-left">
        <img
          src={myImage}
          alt="Logo"
          className="image" 
        />
        <div className="text-container">
          <span className="state-name highlighted-name">{translations.stateName}</span> 
          <span className="sub-title">{translations.subTitle2}</span>
          <span className="sub-title font-bold">{translations.isoCertification}</span>
        </div>
      </div>

      <div className="contact-right">
        <div className="contact-info">
          <i className="fas fa-phone-alt" style={{ marginRight: '8px' }}></i>
          <span>{translations.contactNo}</span>: <a href="tel:+91352645768">{translations.phoneNumbers}</a> 
        </div>
        <div className="email-info"  style={{marginRight:'35px' , fontSize:'15px'}}>
          <i className="fas fa-envelope" style={{ marginRight: '8px' , fontSize: '20px' }}></i>
          <span>{translations.emailUs}</span>: <a href="mailto:info@uksldc.in">{translations.emailAddress}</a> 
        </div>
      </div>
    </header>
  );
};

export default HeaderWithContact;

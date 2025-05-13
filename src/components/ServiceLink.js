import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext';  

const ServiceLinks = () => {
  const { translations } = useLanguage();  

  return (
    <div className="service-links-container"> 
      <div className="service-links">
        {/* Each service item */}
        <div className="service-item">
          <i className="fas fa-download service-icon"></i>
          <span>{translations.downloads}</span> 
        </div>
        <div className="service-item">
          <i className="fas fa-clipboard-list service-icon"></i>
          <span>{translations.publicGrievance}</span> 
        </div>
        <div className="service-item">
          <i className="fas fa-envelope service-icon"></i>
          <span>{translations.employeeMail}</span>
        </div>
        <div className="service-item">
          <i className="fas fa-building service-icon"></i>
          <span>{translations.registeredUtilities}</span>
        </div>
        <div className="service-item">
          <i className="fas fa-file-alt service-icon"></i>
          <span>{translations.electricityAct}</span> 
        </div>
        <div className="service-item">
          <i className="fas fa-code service-icon"></i>
          <span>{translations.delhiGridCode}</span> 
        </div>
      </div>
    </div>
  );
};

export default ServiceLinks;

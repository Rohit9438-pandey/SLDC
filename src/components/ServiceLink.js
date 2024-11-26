import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext';  // Import the useLanguage hook

const ServiceLinks = () => {
  const { translations } = useLanguage();  // Access translations from context

  return (
    <div className="service-links-container"> {/* Box around the entire section */}
      <div className="service-links">
        {/* Each service item */}
        <div className="service-item">
          <i className="fas fa-download service-icon"></i>
          <span>{translations.downloads}</span> {/* Use translation for Downloads */}
        </div>
        <div className="service-item">
          <i className="fas fa-clipboard-list service-icon"></i>
          <span>{translations.publicGrievance}</span> {/* Use translation for Public Grievance Cell */}
        </div>
        <div className="service-item">
          <i className="fas fa-envelope service-icon"></i>
          <span>{translations.employeeMail}</span> {/* Use translation for Employee Mail */}
        </div>
        <div className="service-item">
          <i className="fas fa-building service-icon"></i>
          <span>{translations.registeredUtilities}</span> {/* Use translation for Registered Utilities */}
        </div>
        <div className="service-item">
          <i className="fas fa-file-alt service-icon"></i>
          <span>{translations.electricityAct}</span> {/* Use translation for Electricity Act/Reforms */}
        </div>
        <div className="service-item">
          <i className="fas fa-code service-icon"></i>
          <span>{translations.delhiGridCode}</span> {/* Use translation for Delhi Grid Code */}
        </div>
      </div>
    </div>
  );
};

export default ServiceLinks;

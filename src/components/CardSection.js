import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; 

const CardSection = () => {
  const { translations } = useLanguage(); 

  return (
    <div className="card-section">
      {/* Generation Card */}
      <div className="card">
        <img
          src="/Images/generation.jpg" // Replace with your image path for Generation
          alt={translations.generationAlt} // Use translation for alt text
          className="card-image"
        />
        <div className="card-content">
          <h3>{translations.generationTitle} <i className="fas fa-arrow-right"></i></h3>  {/* Use translation for title */}
        </div>
      </div>

      {/* Transmission Card */}
      <div className="card">
        <img
          src="/Images/transmission.jpg" // Replace with your image path for Transmission
          alt={translations.transmissionAlt} // Use translation for alt text
          className="card-image"
        />
        <div className="card-content">
          <h3>{translations.transmissionTitle} <i className="fas fa-arrow-right"></i></h3>  {/* Use translation for title */}
        </div>
      </div>

      {/* Distribution Card */}
      <div className="card">
        <img
          src="/Images/distribution.jpg" // Replace with your image path for Distribution
          alt={translations.distributionAlt} // Use translation for alt text
          className="card-image"
        />
        <div className="card-content">
          <h3>{translations.distributionTitle} <i className="fas fa-arrow-right"></i></h3>  {/* Use translation for title */}
        </div>
      </div>
    </div>
  );
};

export default CardSection;

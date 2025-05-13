import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; 

const CardSection = () => {
  const { translations } = useLanguage(); 

  return (
    <div className="card-section">
      {/* Generation Card */}
      <div className="card">
        <img
          src="/Images/generation.jpg" 
          alt={translations.generationAlt} 
          className="card-image"
        />
        <div className="card-content">
          <h3>{translations.generationTitle} <i className="fas fa-arrow-right"></i></h3> 
        </div>
      </div>

      {/* Transmission Card */}
      <div className="card">
        <img
          src="/Images/transmission.jpg" 
          alt={translations.transmissionAlt} 
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

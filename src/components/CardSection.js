import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext'; 

// Import images properly from src/Images
import generationImg from '../Images/generation.jpg';
import transmissionImg from '../Images/transmission.jpg';
import distributionImg from '../Images/distribution.jpg';

const CardSection = () => {
  const { translations } = useLanguage(); 

  return (
    <div className="card-section">
      {/* Generation Card */}
      <div className="card">
        <img
          src={generationImg}
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
          src={transmissionImg}
          alt={translations.transmissionAlt}
          className="card-image"
        />
        <div className="card-content">
          <h3>{translations.transmissionTitle} <i className="fas fa-arrow-right"></i></h3>
        </div>
      </div>

      {/* Distribution Card */}
      <div className="card">
        <img
          src={distributionImg}
          alt={translations.distributionAlt}
          className="card-image"
        />
        <div className="card-content">
          <h3>{translations.distributionTitle} <i className="fas fa-arrow-right"></i></h3>
        </div>
      </div>
    </div>
  );
};

export default CardSection;

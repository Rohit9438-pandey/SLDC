import React, { useState } from 'react';
import { useLanguage } from  '../Hoc/LanguageContext';

const Home = () => {
  const { translations } = useLanguage(); // Destructure language and translations from context
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="home-container">
      <div className="image-container">
        <img
          src="/Images/images1.jfif" // Replace with your image path
          alt="SLDC Image"
          className="left-image"
        />
      </div>

      <div className="content-container">
        {/* Render heading and description from translations */}
        <h1>{translations.heading}</h1>
        <p>{translations.description}</p>

        <p>{translations.responsibilitiesTitle}</p>

        {/* List of responsibilities */}
        <div className={`content-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
          <ul>
            {translations.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {isExpanded && (
            <>
              <p>{translations.moreDetailsTitle}</p>
              <ul>
                {translations.moreDetails.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Read more button */}
        <button className="read-more-link" onClick={toggleContent}>
          {isExpanded ? translations.readLess : translations.readMore}
        </button>

       
      </div>
    </div>
  );
};

export default Home;

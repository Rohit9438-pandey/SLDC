import React from 'react';
import { useLanguage } from '../Hoc/LanguageContext';  

const PeakDemand = () => {
  const { translations } = useLanguage(); 

  return (
    <div className="peak-demand-box">
      <div className="demand-info">
        <div className="demand-item">
          <h3>{translations.peakDemandFY}</h3> 
          <p className="peak-demand">8656 MW</p>
          <p className="timestamp">{translations.timestamp}: 6/19/2024 15:06:55 Hrs</p>
        </div>
        <div className="demand-item">
          <h3>{translations.allTimePeakDemand}</h3> 
          <p className="peak-demand">8656 MW</p>
          <p className="timestamp">{translations.timestamp}: 6/19/2024 15:06:55 Hrs</p> 
        </div>
      </div>

      <div className="current-revision">
        <h3>{translations.currentRevision}: 30</h3> 
        <p className="last-update">{translations.lastUpdate}: 11/11/2024 10:53:16</p> 
      </div>

      
      <div className="transmission-info">
        <h3>{translations.transmissionSystem}</h3> 
        <p className="target">
          {translations.targetFixedByDERC}: <span className="highlight">98.50%</span>
        </p>
        <p className="achieved">
          {translations.achievedSEPT}: <span className="highlight">98.520%</span>
        </p>
      </div>
    </div>
  );
};

export default PeakDemand;

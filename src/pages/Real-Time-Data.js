import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';


import DiscomDrawl from './Discom-Drawl'; 
import DelhiGeneration from './Delhi-Generation'; 
import StatesDrawl from './State-Drawl'; 
import GridLoading from './Grid-Loading'; 
import CentralSectorGeneration from './Central-Generation'; 
import DelhiImport from './Delhi-Import'; 
import DelhiExport from './Delhi-Export';

const RealTimeData = () => {
  const [activeSection, setActiveSection] = useState(null); 

  // Functions to set the active section
  const handleDiscomDrawlClick = () => setActiveSection('discomDrawl');
  const handleDelhiGenerationClick = () => setActiveSection('delhiGeneration');
  const handleStatesDrawlClick = () => setActiveSection('statesDrawl');
  const handleGridLoadingClick = () => setActiveSection('gridLoading');
  const handleCentralSectorClick = () => setActiveSection('centralSector');
  const handleDelhiImportClick = () => setActiveSection('delhiImport');
  const handleDelhiExportClick = () => setActiveSection('delhiExport');


  return (
    <div>
     <h2 style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #ff5733, #33c3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '28px',
                fontWeight: 'bold',
                marginTop: '20px'
                
            }}>DELHI POWER SUMMARY</h2>

      <div className="btn">
        <Button variant="primary" onClick={handleDiscomDrawlClick}>Discom Drawl</Button>
        <Button variant="primary" onClick={handleDelhiGenerationClick}>Delhi Generation</Button>
        <Button variant="primary" onClick={handleStatesDrawlClick}>States Drawl</Button>
        <Button variant="primary" onClick={handleGridLoadingClick}>Grid Loading</Button>
        <Button variant="primary" onClick={handleCentralSectorClick}>Central Sector Generation</Button>
        <Button variant="primary" onClick={handleDelhiImportClick}>Delhi Import</Button>
        <Button variant="primary" onClick={handleDelhiExportClick}>Delhi Export</Button>


      </div>

      {/* Conditionally render the components based on active section */}
      {activeSection === 'discomDrawl' && <DiscomDrawl />}
      {activeSection === 'delhiGeneration' && <DelhiGeneration />}
      {activeSection === 'statesDrawl' && <StatesDrawl />}
      {activeSection === 'gridLoading' && <GridLoading />}
      {activeSection === 'centralSector' && <CentralSectorGeneration />}
      {activeSection === 'delhiImport' && <DelhiImport />}
      {activeSection === 'delhiExport' && <DelhiExport />}

    </div>
  );
};

export default RealTimeData;

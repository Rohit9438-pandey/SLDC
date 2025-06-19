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

  return (
    <div className="real-time-container">
      <h2 className="real-time-heading">DELHI POWER SUMMARY</h2>

      <div className="button-grid">
        <Button variant="primary" onClick={() => setActiveSection('discomDrawl')}>Discom Drawl</Button>
        <Button variant="primary" onClick={() => setActiveSection('delhiGeneration')}>Delhi Generation</Button>
        <Button variant="primary" onClick={() => setActiveSection('statesDrawl')}>States Drawl</Button>
        <Button variant="primary" onClick={() => setActiveSection('gridLoading')}>Grid Loading</Button>
        <Button variant="primary" onClick={() => setActiveSection('centralSector')}>Central Sector Generation</Button>
        <Button variant="primary" onClick={() => setActiveSection('delhiImport')}>Delhi Import</Button>
        <Button variant="primary" onClick={() => setActiveSection('delhiExport')}>Delhi Export</Button>
      </div>

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

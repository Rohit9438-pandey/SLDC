// src/components/MainLayout.js
import React from 'react';
import Footer from './Footer';
import SubNavbar from './SubNavbar';
import ServiceLink from './ServiceLink';
import PeakDemand from './PeakDemand';
import Homepage from '../pages/Homepage';
import HeaderWithContact from './HeaderWithContact';
import Dashboard from './Dashboard';
import LoadCurveDelhi from './LoadCurveDelhi';



const MainLayout = ({ children }) => {
  return (
    <div>
      <HeaderWithContact />
      <SubNavbar />
     <Homepage />
     <LoadCurveDelhi />
      < Dashboard />
      <ServiceLink />


   

  
      <main>{children}</main> 
      <PeakDemand />
      <Footer />
     
    </div>
  );
};

export default MainLayout;

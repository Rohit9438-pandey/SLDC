// src/components/MainLayout.js
import React from 'react';
import Footer from './Footer';
import SubNavbar from './SubNavbar';
import ImageSlider from './ImageSlider';
import ServiceLink from './ServiceLink';
import PeakDemand from './PeakDemand';
import Homepage from '../pages/Homepage';
import CardSection from './CardSection';
import HeaderWithContact from './HeaderWithContact';
import Dashboard from './Dashboard';
import LoadCurveDelhi from './LoadCurveDelhi';



const MainLayout = ({ children }) => {
  return (
    <div>
      <HeaderWithContact />
      <SubNavbar />
      <ImageSlider />
      <ServiceLink />
      <Homepage />
      <LoadCurveDelhi />
      < Dashboard />
      <CardSection />

   

  
      <main>{children}</main> 
      <PeakDemand />
      <Footer />
     
    </div>
  );
};

export default MainLayout;

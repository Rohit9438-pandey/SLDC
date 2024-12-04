import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'font-awesome/css/font-awesome.min.css';
import MainLayout from './components/MainLayout';
import Header from './components/Header';


import Home from './pages/Homepage';
import About from './pages/About';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Meetings from './pages/Meetings';
import DiscomDrawl from './pages/Discom-Drawl';
import Details from "./components/Details";





const App = () => {
  return (
    <>
    <Header />
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/about" element={<About />} />  
      <Route path="/contact" element={<Contact />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/meetings" element={<Meetings />} />
      <Route path="/discom-drawl" element={<DiscomDrawl/>} /> 
      <Route path="/details/:newsId" element={<Details />} />


    </Routes>
    </>
    
  
  );
};


export default App;
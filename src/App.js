import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
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
import DrawlDetails from './pages/Drawl-details';
import DelhiGeneration from './pages/Delhi-Generation';
import StateDrawl from './pages/State-Drawl';
import GridLoading from './pages/Grid-Loading';
import CentralGeneration from './pages/Central-Generation';
import DelhiImport from './pages/Delhi-Import';
import RealTimeData from './pages/Real-Time-Data';
import DelhiExport from './pages/Delhi-Export';





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
      <Route path="/" element={<DiscomDrawl/>} /> 
      <Route path="/details/:newsId" element={<Details />} />
      <Route path="/drawl-details/:discom" element={<DrawlDetails />} />
      <Route path="delhi-generation" element={<DelhiGeneration />} />
      <Route path="state-drawl" element={<StateDrawl />} />
      <Route path="/grid-loading" element={<GridLoading />} />
      <Route path="central-section" element={<CentralGeneration />} />
      <Route path="delhi-import" element={<DelhiImport />} />
      <Route path="real-time-data" element={<RealTimeData />} />
      <Route path="delhi-export"  element={<DelhiExport />} />


    </Routes>
    </>
    
  
  );
};


export default App;
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
import DataTable from './pages/DataTable';
import TransformerLoading from './pages/Transformer-loading';
import LineLoading from './pages/Line-loading';
import ElectricityInfo from './pages/ElectricityInfo' ;
import LoadCurve from './pages/Load-curve';
import EntityDetails from './pages/EntityDetails';
import FrequencyCurve from './pages/FrequencyCurve';
import CurveDetails from './pages/CurveDetails';
import StationWiseLoadCurve from './pages/StationWiseLoadCurve';
import OD_UD  from './pages/OD_UD Curve';
import VoltageProfile from './pages/VoltageProfile';
import VoltagePivotPage from './pages/VoltagePivotPage';
import OrganisationChart from './pages/OrganisationChart';
import DrawlSchedule from './pages/DrawlSchedule';
import DrawlScheduleExternal from './pages/DrawlScheduleExternal';
import DeclaredCapacity from './pages/DeclaredCapacity';
import Entitlement from './pages/Entitlement';
import InjectionSchedule from './pages/InjectionSchedule';
import OpenAccessSchedule from './pages/OpenAccessSchedule';


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
      <Route path ="data-table/:discom"  element={<DataTable />} />
      <Route path ="transformer-loading" element={<TransformerLoading />} />
      <Route path="line-loading" element={<LineLoading />} />
      <Route path = "/power-system-in-delhi/about-electricity" element ={<ElectricityInfo />} />
      <Route path = "/load-curve" element={<LoadCurve />} />
      <Route path="/entity-details" element={<EntityDetails />} />
      <Route path ="/frequency-curve" element={<FrequencyCurve />} />
      <Route path="/curve-details" element={<CurveDetails/>} />
      <Route path="/station-wise-load-curve" element={<StationWiseLoadCurve />} />
      <Route path="/OD-UD-Curve" element={<OD_UD Curve/>} />
      <Route path="voltage-profile" element={<VoltageProfile />} />
      <Route path="/voltage-detail-page" element={<VoltagePivotPage />} />
      <Route path="/directory/sldc-organisation-chart" element={<OrganisationChart />} />
      <Route path='/schedules/drawl-schedule' element={<DrawlSchedule />}  />
      <Route path='/schedules/drawl-schedule-external' element={<DrawlScheduleExternal />} />
      <Route path='/schedules/declared/capacity' element={<DeclaredCapacity />} />
      <Route path='/schedules/entitlement' element={<Entitlement />} />
      <Route path='/schedules/injection-schedule' element={<InjectionSchedule />} />
      <Route path ='/schedules/open-access-schedule' element={<OpenAccessSchedule />} />

    </Routes>
    </>
    
  
  );
};


export default App;
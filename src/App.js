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
import InterDiscomTransfer from './pages/InterDiscomTransfer';
import CongestionCharges from './pages/CongestionCharges';
import IntraStateEnergyAccount from './pages/IntraStateEnergyAccount';
import StoaBills from './pages/StoaBills';
import NRLDCCharges from './pages/NRLDCCharges';
import ReactiveEnergy from './pages/ReactiveEnergy';
import OpenCycleGeneration from './pages/OpenCycleGeneration';
import OpenAccessScheduleAccount from './pages/OpenAccessScheduleAccount';
import SourceWiseSales from './pages/SourceWiseSales';
import TransmissionBillCharges from './pages/TransmissionBillCharges';
import UnScheduleInterchange from './pages/UnScheduleInterchange';
import RRASAccount from './pages/RRASAccount';
import MeteringData from './pages/MeteringData';
import SCEDAccounts from './pages/SCEDAccounts';
import DCAndSchedule from './pages/DCAndSchedules';















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
      <Route path='/schedules/open-access-schedule' element={<OpenAccessSchedule />} />
      <Route path='/schedules/inter-discom-transfer' element={<InterDiscomTransfer />} />
      <Route path='/energy-accounting/congestion-charges' element={<CongestionCharges />}/>
      <Route path='/energy-accounting/intra-state-energy-account' element={<IntraStateEnergyAccount />} />
      <Route path='/energy-accounting/stoa-bills' element={<StoaBills />} />
      <Route path='/energy-accounting/nrldc-charges' element={<NRLDCCharges />} />
      <Route path='/energy-accounting/reactive-energy-account' element={<ReactiveEnergy />} />
      <Route path='/energy-accounting/open-cycle-generation' element={<OpenCycleGeneration />} />
      <Route path='/energy-accounting/open-access-application-status' element={<OpenAccessScheduleAccount />} />
      <Route path='/energy-accounting/source-wise-sale-purchase-of-energy' element={<SourceWiseSales />} />
      <Route path='/energy-accounting/transmission-charges-bill' element={<TransmissionBillCharges />} />
      <Route path='/energy-accounting/unscheduled-interchange-bills' element={<UnScheduleInterchange />} />
      <Route path='/energy-accounting/rras-accounts' element={<RRASAccount />} />
      <Route path='/energy-accounting/metering-data' element={<MeteringData />} />
      <Route path='/energy-accounting/sced-accounts' element={<SCEDAccounts />} />
      <Route path='/schedules/dc-and-schedules' element={<DCAndSchedule />} />
    </Routes>
    </>
    
  
  );
};


export default App;
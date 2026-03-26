import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import UploadFiles from './pages/UploadFiles';
import ConfigPage from './pages/CongfigPage';
// import ProcessPage from './pages/ProcessPage';
// import ResultPage from './pages/ResultPage';
// import MissingPage from './pages/MissingPage';
import logo from './assets/logo.svg';
import './App.css';

export default function App() {
  return (
    <Router>
      <header className="app-header">
        <Link to="/" className="logo-link">
          <img src={logo} alt="HLT RONICS" className="app-logo" />
        </Link>
        <h1 className="app-title">EMS BOM Processing</h1>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadFiles />} />
        <Route path="/config" element={<ConfigPage />} />
        {/*<Route path="/process" element={<ProcessPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/missing" element={<MissingPage />} /> */}
      </Routes>
    </Router>
  );
}
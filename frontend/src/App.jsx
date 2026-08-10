import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CropManager from './pages/CropManager';
import SoilAnalyzer from './pages/SoilAnalyzer';
import Weather from './pages/Weather';
import AdvisoryEngine from './pages/AdvisoryEngine';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-wrapper">
          <Navbar />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crops" element={<CropManager />} />
              <Route path="/soil" element={<SoilAnalyzer />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/advisory" element={<AdvisoryEngine />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

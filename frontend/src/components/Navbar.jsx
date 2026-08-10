import React from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Cpu } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Farming Overview & Analytics Dashboard';
      case '/crops': return 'Crop Management System';
      case '/soil': return 'Soil Health & NPK Analyzer';
      case '/weather': return 'Weather Forecast & Climate Module';
      case '/advisory': return 'Rule-Based Farming Advisory Engine';
      case '/reports': return 'Reports, Analytics & Data Export';
      default: return 'AgriSense Simulator';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="navbar">
      <h1 className="navbar-title">{getPageTitle()}</h1>
      <div className="navbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Calendar size={16} />
          <span>{currentDate}</span>
        </div>
        <div className="status-indicator">
          <div className="status-dot"></div>
          <Cpu size={14} />
          <span>System Active</span>
        </div>
      </div>
    </header>
  );
}

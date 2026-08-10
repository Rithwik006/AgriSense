import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, TestTube2, CloudSun, Lightbulb, FileSpreadsheet, Leaf } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/crops', label: 'Crop Manager', icon: Sprout },
    { path: '/soil', label: 'Soil Analyzer', icon: TestTube2 },
    { path: '/weather', label: 'Weather', icon: CloudSun },
    { path: '/advisory', label: 'Advisory Engine', icon: Lightbulb },
    { path: '/reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Leaf size={22} />
        </div>
        <div>
          <div className="sidebar-title">AGRI SENSE</div>
          <div className="sidebar-sub">Farming Advisory Simulator</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>AgriSense System v1.0</div>
        <div style={{ opacity: 0.8, fontSize: '11px', marginTop: '4px' }}>Powered by FastAPI & React</div>
      </div>
    </aside>
  );
}

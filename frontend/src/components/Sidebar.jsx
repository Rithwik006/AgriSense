import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, TestTube2, CloudSun, Lightbulb, FileSpreadsheet, Leaf } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
  const { t } = useLanguage();

  const navItems = [
    { path: '/', labelKey: 'dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
    { path: '/crops', labelKey: 'crops', fallback: 'Crop Manager', icon: Sprout },
    { path: '/soil', labelKey: 'soil', fallback: 'Soil Analyzer', icon: TestTube2 },
    { path: '/weather', labelKey: 'weather', fallback: 'Weather', icon: CloudSun },
    { path: '/advisory', labelKey: 'advisory', fallback: 'Advisory Engine', icon: Lightbulb },
    { path: '/reports', labelKey: 'reports', fallback: 'Reports & Analytics', icon: FileSpreadsheet },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Leaf size={22} />
        </div>
        <div>
          <div className="sidebar-title">{t('appTitle', 'AGRI SENSE')}</div>
          <div className="sidebar-sub">{t('appSub', 'Farming Advisory Simulator')}</div>
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
              <span>{t(item.labelKey, item.fallback)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>{t('appTitle', 'AgriSense')} System v1.0</div>
        <div style={{ opacity: 0.8, fontSize: '11px', marginTop: '4px' }}>FastAPI & React Precision Platform</div>
      </div>
    </aside>
  );
}

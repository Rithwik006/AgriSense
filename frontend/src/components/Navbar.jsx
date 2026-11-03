import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Calendar, Cpu, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">{getPageTitle()}</h1>
      <div className="navbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Calendar size={16} />
          <span>{currentDate}</span>
        </div>

        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px'
              }}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user.farm_name || 'AgriSense Member'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              title="Sign Out of Farm Session"
            >
              <LogOut size={14} color="#dc2626" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogIn size={14} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}

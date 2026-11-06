import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguage();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return `${t('dashboard')} — ${t('appSub')}`;
      case '/crops': return `${t('crops')} — ${t('manageCrops')}`;
      case '/soil': return `${t('soil')} — ${t('soilTitle')}`;
      case '/weather': return `${t('weather')} — ${t('weatherTitle')}`;
      case '/advisory': return `${t('advisory')} — ${t('advisoryTitle')}`;
      case '/reports': return `${t('reports')} — ${t('reportsTitle')}`;
      default: return `${t('appTitle')} — ${t('appSub')}`;
    }
  };

  const currentDate = new Date().toLocaleDateString(language === 'en' ? 'en-US' : `${language}-IN`, {
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
        {/* Multilingual Selector */}
        <LanguageSelector compact />

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
              title={t('signOut')}
            >
              <LogOut size={14} color="#dc2626" />
              <span>{t('signOut')}</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogIn size={14} />
            <span>{t('signIn')}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

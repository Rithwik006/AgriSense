import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, User, Tractor, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';
import LanguageSelector from '../components/LanguageSelector';
import VoiceInput from '../components/VoiceInput';

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    farm_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { t, currentLangObj } = useLanguage();
  const navigate = useNavigate();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const fullNameInputRef = useRef(null);

  const isEmailValid = (email) => {
    if (!email) return false;
    const clean = email.trim();
    return clean.length >= 5 && clean.length <= 254 && !clean.includes('..') && EMAIL_REGEX.test(clean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const executeAuth = async () => {
    setError('');

    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    // 1. Check if both email and password are provided
    if (!cleanEmail || !cleanPassword) {
      setError(t('fillBothMsg', 'Please enter both email address and password before submitting.'));
      if (!cleanEmail && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (!cleanPassword && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
      return;
    }

    // 2. Validate email format
    if (!isEmailValid(cleanEmail)) {
      setError(t('invalidEmailMsg', 'Please enter a valid email address (e.g. farmer@agrisense.com).'));
      if (emailInputRef.current) emailInputRef.current.focus();
      return;
    }

    // 3. For registration, validate full name
    if (!isLogin && !formData.full_name.trim()) {
      setError('Please provide your full name to create an account.');
      if (fullNameInputRef.current) fullNameInputRef.current.focus();
      return;
    }

    // 4. For registration, validate password length
    if (!isLogin && cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      if (passwordInputRef.current) passwordInputRef.current.focus();
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(cleanEmail, cleanPassword);
      } else {
        await register({
          full_name: formData.full_name.trim(),
          email: cleanEmail,
          password: cleanPassword,
          farm_name: formData.farm_name.trim() || 'My Farm'
        });
      }
      navigate('/');
    } catch (err) {
      const serverMsg = err.response?.data?.detail;
      if (serverMsg && (serverMsg.includes('already exists') || serverMsg.includes('only one account'))) {
        setError(t('duplicateEmailMsg', 'An account with this email address already exists. Each email address can have only one account. Please sign in instead.'));
      } else {
        setError(serverMsg || 'Authentication failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    executeAuth();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const hasEmail = Boolean(formData.email.trim());
      const hasPassword = Boolean(formData.password.trim());

      if (e.target.name === 'email' && !hasPassword) {
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
        return;
      }

      if (e.target.name === 'password' && !hasEmail) {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
        return;
      }

      // Both email and password entered -> trigger authentication!
      executeAuth();
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@agrisense.com', 'password123');
      navigate('/');
    } catch (err) {
      setError('Demo login failed. Make sure the backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0fdf4',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '980px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        overflow: 'hidden'
      }}>
        {/* Left Side: Brand & Feature Highlights */}
        <div style={{
          background: 'linear-gradient(135deg, #0f391f 0%, #14532d 100%)',
          color: '#ffffff',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#22c55e',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Leaf size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>{t('appTitle', 'AGRI SENSE')}</h2>
                <p style={{ fontSize: '12px', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('appSub', 'Farming Advisory Simulator')}
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px' }}>
              Precision Agricultural Decision Matrix & Farm Management.
            </h3>
            <p style={{ color: '#bbf7d0', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              Empowering farmers with live weather telemetry, soil NPK analysis, crop lifecycle tracking, and scientific advisories in your native language.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#dcfce7' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>{t('crops')} — Full Lifecycle & Yield Tracker</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#dcfce7' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>{t('soil')} — NPK Fertility & Amendment Advisor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#dcfce7' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>{t('weather')} — Live Open-Meteo & Climate Module</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#dcfce7' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>{t('voiceInput')} — Voice enabled in {currentLangObj.native}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', color: '#86efac' }}>
            🔒 {t('singleAccountNotice')}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div style={{ padding: '40px' }}>
          {/* Header Bar with Language Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              🌐 Language:
            </span>
            <LanguageSelector compact />
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s',
                backgroundColor: isLogin ? '#ffffff' : 'transparent',
                color: isLogin ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s',
                backgroundColor: !isLogin ? '#ffffff' : 'transparent',
                color: !isLogin ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {t('createAccount')}
            </button>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
              {isLogin ? t('welcomeBack') : t('joinNetwork')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isLogin ? t('welcomeSub') : t('joinSub')}
            </p>
          </div>

          {/* Single Account Notice Banner */}
          {!isLogin && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span>{t('singleAccountNotice')}</span>
            </div>
          )}

          {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">{t('fullName')} *</label>
                    <VoiceInput
                      inline
                      onTranscript={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      ref={fullNameInputRef}
                      type="text"
                      name="full_name"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      placeholder="e.g. Rithwik Goud"
                      value={formData.full_name}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">{t('farmName')}</label>
                    <VoiceInput
                      inline
                      onTranscript={(text) => setFormData((prev) => ({ ...prev, farm_name: text }))}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Tractor size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      name="farm_name"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      placeholder="e.g. Green Valley Plot A"
                      value={formData.farm_name}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('emailAddress')} *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {formData.email && (
                    <span style={{
                      fontSize: '11px',
                      color: isEmailValid(formData.email) ? '#16a34a' : '#dc2626',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      {isEmailValid(formData.email) ? '✓ Valid' : '✗ Invalid format'}
                    </span>
                  )}
                  <VoiceInput
                    inline
                    onTranscript={(text) => {
                      const clean = text.toLowerCase().replace(/\s+/g, '');
                      setFormData((prev) => ({ ...prev, email: clean }));
                    }}
                  />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  className="form-input"
                  style={{
                    paddingLeft: '38px',
                    borderColor: formData.email && !isEmailValid(formData.email) ? '#fca5a5' : undefined
                  }}
                  placeholder="farmer@agrisense.com"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('password')} *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  ref={passwordInputRef}
                  type="password"
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            {/* Quick keyboard instruction hint */}
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{t('pressEnterTip')}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? t('authenticating') : (isLogin ? t('signInBtn') : t('registerBtn'))}
              <ArrowRight size={16} />
            </button>

            {isLogin && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t('orQuickAccess')}
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '13px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  disabled={loading}
                >
                  <ShieldCheck size={16} color="var(--primary)" />
                  {t('demoLogin')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

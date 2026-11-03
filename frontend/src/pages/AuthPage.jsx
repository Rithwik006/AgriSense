import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, User, Tractor, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          farm_name: formData.farm_name || 'My Farm'
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
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
        maxWidth: '960px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>AGRI SENSE</h2>
                <p style={{ fontSize: '12px', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Farming Advisory Simulator
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.25, marginBottom: '16px' }}>
              Precision Agricultural Decision Matrix & Farm Management.
            </h3>
            <p style={{ color: '#bbf7d0', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              Empowering farmers and agronomists with live weather telemetry, soil NPK analysis, crop lifecycle tracking, and scientific advisories.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#dcfce7' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>Full CRUD Crop Lifecycle & Yield Tracker</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#dcfce7' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>Rule-Based Soil Fertility & Amendment Advisor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4ade80' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>Live Open-Meteo Weather Integration</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', color: '#86efac' }}>
            🔒 Secured with PBKDF2 Password Hashing & Signed JWT Tokens
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div style={{ padding: '40px' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '24px'
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
              Sign In
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
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
              {isLogin ? 'Welcome Back, Farmer' : 'Join AgriSense Network'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isLogin ? 'Enter your farm credentials to access simulator' : 'Register your farm account to start logging crops'}
            </p>
          </div>

          {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      name="full_name"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      placeholder="e.g. Rithwik Goud"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Farm / Facility Name</label>
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
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="farmer@agrisense.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In to Dashboard' : 'Register Account')}
              <ArrowRight size={16} />
            </button>

            {isLogin && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or quick access</span>
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
                  One-Click Demo Account Sign In
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { analyzeSoil, getSoilReports } from '../services/api';
import SoilResult from '../components/SoilResult';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import VoiceInput from '../components/VoiceInput';
import { useLanguage } from '../context/LanguageContext';
import { TestTube2, History, Send, MapPin, Sparkles } from 'lucide-react';

const SOIL_PRESETS = [
  { label: 'Fertile Alluvial (Delta Basin)', ph: '6.8', n: '45.0', p: '28.0', k: '190.0', m: '52.0' },
  { label: 'Acidic Red Soil (Telangana/AP)', ph: '5.2', n: '18.0', p: '12.0', k: '95.0', m: '28.0' },
  { label: 'Alkaline Black Soil (Deccan)', ph: '8.2', n: '32.0', p: '16.0', k: '210.0', m: '42.0' },
  { label: 'Dry Sandy Loam (Arid Zone)', ph: '7.4', n: '12.0', p: '8.0', k: '80.0', m: '18.0' }
];

export default function SoilAnalyzer() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    location: 'Main Farm Sector 1',
    ph: '6.5',
    nitrogen: '30.0',
    phosphorus: '20.0',
    potassium: '150.0',
    moisture: '45.0'
  });

  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await getSoilReports();
      setHistory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ph: preset.ph,
      nitrogen: preset.n,
      phosphorus: preset.p,
      potassium: preset.k,
      moisture: preset.m
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAlert(null);

    const phNum = parseFloat(formData.ph);
    const nNum = parseFloat(formData.nitrogen);
    const pNum = parseFloat(formData.phosphorus);
    const kNum = parseFloat(formData.potassium);
    const mNum = parseFloat(formData.moisture);

    if (isNaN(phNum) || phNum < 0 || phNum > 14) {
      setAlert({ type: 'error', message: 'pH must be a number between 0 and 14.' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        location: formData.location.trim(),
        ph: phNum,
        nitrogen: nNum,
        phosphorus: pNum,
        potassium: kNum,
        moisture: mNum
      };
      const res = await analyzeSoil(payload);
      setCurrentResult(res);
      setAlert({ type: 'success', message: 'Soil test analysis generated and stored in SQLite database successfully.' });
      fetchHistory();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.detail || 'Failed to analyze soil sample.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="grid-cols-2">
        {/* Form Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TestTube2 size={20} color="var(--primary)" />
              {t('soilTitle')}
            </h3>
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="var(--primary)" />
              <span>Quick Soil Sample Presets</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SOIL_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => handleApplyPreset(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('fieldLocation')} *</label>
                <VoiceInput
                  inline
                  onTranscript={(text) => setFormData((prev) => ({ ...prev, location: text }))}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="e.g. North Plot Sector A, Warangal"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{t('phValue')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  name="ph"
                  className="form-input"
                  value={formData.ph}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('moisture')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="moisture"
                  className="form-input"
                  value={formData.moisture}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">{t('nitrogen')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="nitrogen"
                  className="form-input"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('phosphorus')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="phosphorus"
                  className="form-input"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('potassium')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="potassium"
                  className="form-input"
                  value={formData.potassium}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              <Send size={16} />
              {loading ? t('analyzing') : t('analyzeBtn')}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div>
          {loading ? (
            <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner message={t('analyzing')} />
            </div>
          ) : currentResult ? (
            <SoilResult report={currentResult.report} analysis={currentResult.analysis} />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <TestTube2 size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>No Soil Test Loaded</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Fill in the soil chemical values on the left or select a sample preset to run the NPK fertility matrix.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} color="var(--primary)" />
            {t('soilHistory')}
          </h3>
          <span className="badge badge-success">{history.length} samples analyzed</span>
        </div>

        {historyLoading ? (
          <LoadingSpinner message="Loading soil history..." />
        ) : history.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('fieldLocation')}</th>
                  <th>pH</th>
                  <th>{t('nitrogen')}</th>
                  <th>{t('phosphorus')}</th>
                  <th>{t('potassium')}</th>
                  <th>{t('moisture')}</th>
                  <th>{t('status')}</th>
                  <th>{t('plantingDate', 'Analyzed At')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 700 }}>{h.location}</td>
                    <td><b>{h.ph}</b></td>
                    <td>{h.nitrogen}</td>
                    <td>{h.phosphorus}</td>
                    <td>{h.potassium}</td>
                    <td>{h.moisture}%</td>
                    <td><span className="badge badge-primary">{h.overall_condition}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(h.analyzed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No soil reports analyzed yet.</p>
        )}
      </div>
    </div>
  );
}

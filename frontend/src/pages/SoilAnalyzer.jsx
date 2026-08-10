import React, { useState, useEffect } from 'react';
import { analyzeSoil, getSoilReports } from '../services/api';
import SoilResult from '../components/SoilResult';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { TestTube2, History, Send, MapPin } from 'lucide-react';

export default function SoilAnalyzer() {
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
              Soil Testing Input Parameters
            </h3>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">Field / Location Name *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="e.g. North Plot Sector A"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">pH Level (0.0 - 14.0) *</label>
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
                <label className="form-label">Moisture Level (%) *</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nitrogen (N)</label>
                <input
                  type="number"
                  step="0.1"
                  name="nitrogen"
                  className="form-input"
                  placeholder="mg/kg"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phosphorus (P)</label>
                <input
                  type="number"
                  step="0.1"
                  name="phosphorus"
                  className="form-input"
                  placeholder="mg/kg"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Potassium (K)</label>
                <input
                  type="number"
                  step="0.1"
                  name="potassium"
                  className="form-input"
                  placeholder="mg/kg"
                  value={formData.potassium}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
              <Send size={16} />
              {loading ? 'Analyzing Soil Logic...' : 'Analyze Soil'}
            </button>
          </form>
        </div>

        {/* Live Analysis Output */}
        <div>
          {loading ? (
            <LoadingSpinner message="Executing rule-based soil analyzer in Python..." />
          ) : currentResult ? (
            <SoilResult report={currentResult.report} analysis={currentResult.analysis} />
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              <TestTube2 size={48} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h4>No Soil Analysis Executed Yet</h4>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                Fill in the soil parameters on the left and click "Analyze Soil" to receive actionable fertility results and fertilizer suggestions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Soil Reports */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} />
            Historical Soil Testing Log ({history.length})
          </h3>
        </div>

        {historyLoading ? (
          <LoadingSpinner message="Fetching soil report history..." />
        ) : history.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>pH</th>
                  <th>N (mg/kg)</th>
                  <th>P (mg/kg)</th>
                  <th>K (mg/kg)</th>
                  <th>Moisture</th>
                  <th>Overall Condition</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rep) => (
                  <tr key={rep.id}>
                    <td>#{rep.id}</td>
                    <td style={{ fontWeight: 600 }}>{rep.location}</td>
                    <td>{rep.ph}</td>
                    <td>{rep.nitrogen}</td>
                    <td>{rep.phosphorus}</td>
                    <td>{rep.potassium}</td>
                    <td>{rep.moisture}%</td>
                    <td>
                      <span className="badge badge-success">{rep.overall_condition}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No historical soil reports found.</p>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { generateAdvisory, getAdvisories, getCrops, getSoilReports, getWeatherRecords } from '../services/api';
import AdvisoryCard from '../components/AdvisoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { Lightbulb, Send, History, Sprout, TestTube2, CloudSun } from 'lucide-react';

export default function AdvisoryEngine() {
  const [crops, setCrops] = useState([]);
  const [soilReports, setSoilReports] = useState([]);
  const [weatherRecords, setWeatherRecords] = useState([]);
  const [advisories, setAdvisories] = useState([]);

  // Form input state
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedSoilId, setSelectedSoilId] = useState('');
  const [selectedWeatherId, setSelectedWeatherId] = useState('');

  // Optional manual metrics state
  const [useManual, setUseManual] = useState(false);
  const [manualMetrics, setManualMetrics] = useState({
    ph: '6.5',
    n: '25.0',
    p: '18.0',
    k: '120.0',
    moisture: '40.0',
    temp: '30.0',
    rain: '5.0',
    hum: '65.0'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState(null);

  const loadData = async () => {
    try {
      setFetching(true);
      const [cropsRes, soilRes, weatherRes, advRes] = await Promise.all([
        getCrops(),
        getSoilReports(),
        getWeatherRecords(),
        getAdvisories()
      ]);
      setCrops(cropsRes);
      setSoilReports(soilRes);
      setWeatherRecords(weatherRes);
      setAdvisories(advRes);

      if (cropsRes.length > 0) setSelectedCrop(cropsRes[0].crop_name);
      if (soilRes.length > 0) setSelectedSoilId(soilRes[0].id.toString());
      if (weatherRes.length > 0) setSelectedWeatherId(weatherRes[0].id.toString());
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load initial context for advisory engine.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedCrop) return;

    try {
      setLoading(true);
      setAlert(null);

      const payload = {
        crop_name: selectedCrop,
        soil_id: selectedSoilId ? parseInt(selectedSoilId) : null,
        weather_id: selectedWeatherId ? parseInt(selectedWeatherId) : null
      };

      if (useManual) {
        payload.manual_ph = parseFloat(manualMetrics.ph);
        payload.manual_nitrogen = parseFloat(manualMetrics.n);
        payload.manual_phosphorus = parseFloat(manualMetrics.p);
        payload.manual_potassium = parseFloat(manualMetrics.k);
        payload.manual_moisture = parseFloat(manualMetrics.moisture);
        payload.manual_temperature = parseFloat(manualMetrics.temp);
        payload.manual_rainfall = parseFloat(manualMetrics.rain);
        payload.manual_humidity = parseFloat(manualMetrics.hum);
      }

      await generateAdvisory(payload);
      setAlert({ type: 'success', message: `Farming advisory generated and saved into database for '${selectedCrop}'.` });
      const updatedAdvisories = await getAdvisories();
      setAdvisories(updatedAdvisories);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.detail || 'Failed to generate advisory.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="grid-cols-2">
        {/* Advisory Input Generator */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Lightbulb size={20} color="var(--primary)" />
              Generate Rule-Based Advisory
            </h3>
          </div>

          {fetching ? (
            <LoadingSpinner message="Loading farm context options..." />
          ) : (
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Target Crop *</label>
                <select
                  className="form-select"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  required
                >
                  {crops.length > 0 ? (
                    crops.map((c) => (
                      <option key={c.id} value={c.crop_name}>{c.crop_name} ({c.category} - {c.season})</option>
                    ))
                  ) : (
                    <>
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Maize">Maize</option>
                    </>
                  )}
                </select>
              </div>

              {!useManual ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Linked Soil Analysis Record *</label>
                    <select
                      className="form-select"
                      value={selectedSoilId}
                      onChange={(e) => setSelectedSoilId(e.target.value)}
                    >
                      <option value="">Select Soil Report...</option>
                      {soilReports.map((s) => (
                        <option key={s.id} value={s.id}>
                          #{s.id} - {s.location} (pH {s.ph}, N:{s.nitrogen} P:{s.phosphorus} K:{s.potassium})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Linked Weather Record *</label>
                    <select
                      className="form-select"
                      value={selectedWeatherId}
                      onChange={(e) => setSelectedWeatherId(e.target.value)}
                    >
                      <option value="">Select Weather Record...</option>
                      {weatherRecords.map((w) => (
                        <option key={w.id} value={w.id}>
                          #{w.id} - {w.location} ({w.temperature}°C, {w.weather_description})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div style={{ backgroundColor: '#f9fafb', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Custom Override Parameters</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>pH</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.ph} onChange={(e) => setManualMetrics({ ...manualMetrics, ph: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Nitrogen</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.n} onChange={(e) => setManualMetrics({ ...manualMetrics, n: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Moisture %</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.moisture} onChange={(e) => setManualMetrics({ ...manualMetrics, moisture: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Temp (°C)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.temp} onChange={(e) => setManualMetrics({ ...manualMetrics, temp: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px' }}>Rainfall (mm)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.rain} onChange={(e) => setManualMetrics({ ...manualMetrics, rain: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  id="manualCheck"
                  checked={useManual}
                  onChange={(e) => setUseManual(e.target.checked)}
                />
                <label htmlFor="manualCheck" style={{ cursor: 'pointer' }}>Use Custom Override Metrics</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Send size={16} />
                {loading ? 'Evaluating Rules in Python...' : 'Run Advisory Engine'}
              </button>
            </form>
          )}
        </div>

        {/* Latest Generated Advisory */}
        <div>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <h3 className="card-title">Generated Advisory Preview</h3>
          </div>
          {advisories.length > 0 ? (
            <AdvisoryCard advisory={advisories[0]} />
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select crop parameters and click Run Advisory Engine.
            </div>
          )}
        </div>
      </div>

      {/* Advisory Feed List */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} />
            All Generated Advisories ({advisories.length})
          </h3>
        </div>

        {advisories.length > 0 ? (
          <div>
            {advisories.map((adv) => (
              <AdvisoryCard key={adv.id} advisory={adv} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No historical advisories found.</p>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { generateAdvisory, getAdvisories, getCrops, getSoilReports, getWeatherRecords } from '../services/api';
import AdvisoryCard from '../components/AdvisoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import VoiceInput from '../components/VoiceInput';
import { useLanguage } from '../context/LanguageContext';
import { Lightbulb, Send, History, Sprout, TestTube2, CloudSun } from 'lucide-react';

export default function AdvisoryEngine() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [soilReports, setSoilReports] = useState([]);
  const [weatherRecords, setWeatherRecords] = useState([]);
  const [advisories, setAdvisories] = useState([]);

  // Form input state
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [customCropInput, setCustomCropInput] = useState('');
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
    const finalCrop = customCropInput.trim() || selectedCrop;
    if (!finalCrop) return;

    try {
      setLoading(true);
      setAlert(null);

      const payload = {
        crop_name: finalCrop,
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
      setAlert({ type: 'success', message: `Farming advisory generated and saved into database for '${finalCrop}'.` });
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
              {t('advisoryTitle')}
            </h3>
          </div>

          {fetching ? (
            <LoadingSpinner message="Loading farm context options..." />
          ) : (
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{t('selectCropPrompt')} *</label>
                  <VoiceInput
                    inline
                    onTranscript={(text) => {
                      setCustomCropInput(text);
                      setSelectedCrop(text);
                    }}
                  />
                </div>
                <select
                  className="form-select"
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setCustomCropInput('');
                  }}
                >
                  {crops.length > 0 ? (
                    crops.map((c) => (
                      <option key={c.id} value={c.crop_name}>
                        {c.crop_name} ({c.category} - {c.season})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Rice">Rice (Paddy)</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Maize">Maize</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Chilli">Chilli / Pepper</option>
                    </>
                  )}
                </select>

                {customCropInput && (
                  <div style={{ fontSize: '12px', color: 'var(--primary-dark)', marginTop: '4px' }}>
                    Voice Selected: <b>{customCropInput}</b>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('linkSoilPrompt')}</label>
                <div style={{ position: 'relative' }}>
                  <TestTube2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select
                    className="form-select"
                    style={{ paddingLeft: '38px' }}
                    value={selectedSoilId}
                    onChange={(e) => setSelectedSoilId(e.target.value)}
                    disabled={useManual}
                  >
                    <option value="">-- No Soil Link (Use Standard Default) --</option>
                    {soilReports.map((s) => (
                      <option key={s.id} value={s.id}>
                        #{s.id} - {s.location} (pH {s.ph}, {s.overall_condition})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('linkWeatherPrompt')}</label>
                <div style={{ position: 'relative' }}>
                  <CloudSun size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select
                    className="form-select"
                    style={{ paddingLeft: '38px' }}
                    value={selectedWeatherId}
                    onChange={(e) => setSelectedWeatherId(e.target.value)}
                    disabled={useManual}
                  >
                    <option value="">-- No Weather Link (Use Standard Default) --</option>
                    {weatherRecords.map((w) => (
                      <option key={w.id} value={w.id}>
                        #{w.id} - {w.location} ({w.temperature}°C, {w.weather_description})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Manual Override Toggle */}
              <div style={{ marginTop: '16px', marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={useManual}
                    onChange={(e) => setUseManual(e.target.checked)}
                  />
                  <span>{t('manualOverrides')}</span>
                </label>

                {useManual && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>pH</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.ph} onChange={(e) => setManualMetrics({ ...manualMetrics, ph: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>N (mg/kg)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.n} onChange={(e) => setManualMetrics({ ...manualMetrics, n: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>P (mg/kg)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.p} onChange={(e) => setManualMetrics({ ...manualMetrics, p: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>K (mg/kg)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.k} onChange={(e) => setManualMetrics({ ...manualMetrics, k: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Moisture %</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.moisture} onChange={(e) => setManualMetrics({ ...manualMetrics, moisture: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temp (°C)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.temp} onChange={(e) => setManualMetrics({ ...manualMetrics, temp: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rain (mm)</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.rain} onChange={(e) => setManualMetrics({ ...manualMetrics, rain: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Humidity %</label>
                      <input type="number" step="0.1" className="form-input" value={manualMetrics.hum} onChange={(e) => setManualMetrics({ ...manualMetrics, hum: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Send size={16} />
                {loading ? t('generating') : t('generateAdvisoryBtn')}
              </button>
            </form>
          )}
        </div>

        {/* Advisory List */}
        <div>
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <h3 className="card-title">
              <History size={18} color="var(--primary)" />
              {t('advisoryCards')}
            </h3>
            <span className="badge badge-success">{advisories.length} Generated</span>
          </div>

          {advisories.length > 0 ? (
            <div style={{ maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
              {advisories.map((adv) => (
                <AdvisoryCard key={adv.id} advisory={adv} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Lightbulb size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>No Advisories Generated</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Select a crop on the left and click "{t('generateAdvisoryBtn')}" to generate agricultural advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

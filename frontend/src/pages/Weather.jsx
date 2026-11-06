import React, { useState, useEffect } from 'react';
import { fetchLiveWeather, saveManualWeather, getWeatherRecords } from '../services/api';
import WeatherCard from '../components/WeatherCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import VoiceInput from '../components/VoiceInput';
import { useLanguage } from '../context/LanguageContext';
import { CloudSun, Search, Edit3, MapPin, History, RefreshCw, Compass } from 'lucide-react';

const POPULAR_HUBS = [
  { name: 'Hyderabad', region: 'Telangana' },
  { name: 'Warangal', region: 'Telangana' },
  { name: 'Vijayawada', region: 'Andhra Pradesh' },
  { name: 'Guntur', region: 'Andhra Pradesh' },
  { name: 'Ludhiana', region: 'Punjab' },
  { name: 'Amritsar', region: 'Punjab' },
  { name: 'Pune', region: 'Maharashtra' },
  { name: 'Nagpur', region: 'Maharashtra' },
  { name: 'Bengaluru', region: 'Karnataka' },
  { name: 'Chennai', region: 'Tamil Nadu' },
  { name: 'New Delhi', region: 'Delhi NCR' },
  { name: 'Lucknow', region: 'Uttar Pradesh' }
];

export default function Weather() {
  const { t, currentLangObj } = useLanguage();
  const [locationInput, setLocationInput] = useState('Hyderabad');
  const [activeWeather, setActiveWeather] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Manual Mode toggle
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState({
    location: 'Farm Plot Sector B',
    temperature: '28.5',
    humidity: '65.0',
    rainfall: '10.0',
    wind_speed: '12.0',
    weather_description: 'Light Drizzle'
  });

  const fetchRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await getWeatherRecords();
      setRecords(res);
      if (res.length > 0 && !activeWeather) {
        setActiveWeather(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFetchWeather = async (targetLoc) => {
    const query = (typeof targetLoc === 'string' ? targetLoc : locationInput).trim();
    if (!query) return;

    try {
      setLoading(true);
      setAlert(null);
      const res = await fetchLiveWeather({ location: query });
      setActiveWeather(res.record);
      setIsFallback(res.is_fallback);
      if (res.is_fallback) {
        setAlert({
          type: 'info',
          message: `${t('offlineBadge')}: Meteorological estimate calculated for '${res.record.location}'.`
        });
      } else {
        setAlert({
          type: 'success',
          message: `Live Open-Meteo weather telemetry fetched for '${res.record.location}' and saved.`
        });
      }
      fetchRecords();
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Weather service request failed. You can switch to manual entry if needed.'
      });
      setIsManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setAlert(null);
      const payload = {
        location: manualData.location.trim(),
        temperature: parseFloat(manualData.temperature),
        humidity: parseFloat(manualData.humidity),
        rainfall: parseFloat(manualData.rainfall),
        wind_speed: parseFloat(manualData.wind_speed),
        weather_description: manualData.weather_description.trim()
      };
      const res = await saveManualWeather(payload);
      setActiveWeather(res);
      setIsFallback(true);
      setAlert({ type: 'success', message: 'Manual weather record saved successfully.' });
      fetchRecords();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.detail || 'Failed to save manual weather data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="grid-cols-2">
        {/* Input Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CloudSun size={20} color="var(--primary)" />
              {isManualMode ? t('manualWeatherTitle') : t('weatherTitle')}
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsManualMode(!isManualMode)}
            >
              <Edit3 size={14} />
              {isManualMode ? t('switchToLive') : t('switchToManual')}
            </button>
          </div>

          {!isManualMode ? (
            <form onSubmit={(e) => { e.preventDefault(); handleFetchWeather(); }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{t('locationQuery')} *</label>
                  <VoiceInput
                    inline
                    onTranscript={(spokenText) => {
                      setLocationInput(spokenText);
                      handleFetchWeather(spokenText);
                    }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. Hyderabad, Warangal, Ludhiana, Pune..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Quick Regional Hub Selection */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Compass size={14} />
                  <span>{t('popularRegions')}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {POPULAR_HUBS.map((hub) => (
                    <button
                      key={hub.name}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => {
                        setLocationInput(hub.name);
                        handleFetchWeather(hub.name);
                      }}
                    >
                      {hub.name} ({hub.region})
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? t('fetchingWeather') : t('fetchWeatherBtn')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{t('fieldLocation')} *</label>
                  <VoiceInput
                    inline
                    onTranscript={(text) => setManualData({ ...manualData, location: text })}
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={manualData.location}
                  onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">{t('temperature')} (°C) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={manualData.temperature}
                    onChange={(e) => setManualData({ ...manualData, temperature: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('humidity')} (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={manualData.humidity}
                    onChange={(e) => setManualData({ ...manualData, humidity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">{t('rainfall')} (mm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={manualData.rainfall}
                    onChange={(e) => setManualData({ ...manualData, rainfall: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('windSpeed')} (km/h) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={manualData.wind_speed}
                    onChange={(e) => setManualData({ ...manualData, wind_speed: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('weatherDesc')} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={manualData.weather_description}
                  onChange={(e) => setManualData({ ...manualData, weather_description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {t('saveCrop', 'Save Weather Record')}
              </button>
            </form>
          )}
        </div>

        {/* Display Card Panel */}
        <div>
          {loading ? (
            <div className="card" style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner message={t('fetchingWeather')} />
            </div>
          ) : activeWeather ? (
            <WeatherCard weather={activeWeather} isLive={true} isFallback={isFallback} />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <CloudSun size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>
                {t('locationQuery')} to fetch current conditions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Weather Logs */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} color="var(--primary)" />
            {t('weatherHistory')}
          </h3>
          <span className="badge badge-success">{records.length} records logged</span>
        </div>

        {recordsLoading ? (
          <LoadingSpinner message="Loading records history..." />
        ) : records.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('location')}</th>
                  <th>{t('temperature')}</th>
                  <th>{t('humidity')}</th>
                  <th>{t('rainfall')}</th>
                  <th>{t('windSpeed')}</th>
                  <th>{t('weatherDesc')}</th>
                  <th>{t('plantingDate', 'Recorded At')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => { setActiveWeather(r); setIsFallback(false); }}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{r.location}</td>
                    <td><b>{r.temperature}°C</b></td>
                    <td>{r.humidity}%</td>
                    <td>{r.rainfall} mm</td>
                    <td>{r.wind_speed} km/h</td>
                    <td><span className="badge badge-primary">{r.weather_description}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(r.recorded_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('noWeather')}</p>
        )}
      </div>
    </div>
  );
}

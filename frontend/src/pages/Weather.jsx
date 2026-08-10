import React, { useState, useEffect } from 'react';
import { fetchLiveWeather, saveManualWeather, getWeatherRecords } from '../services/api';
import WeatherCard from '../components/WeatherCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { CloudSun, Search, Edit3, MapPin, History, RefreshCw } from 'lucide-react';

export default function Weather() {
  const [locationInput, setLocationInput] = useState('New Delhi');
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

  const handleFetchWeather = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    try {
      setLoading(true);
      setAlert(null);
      const res = await fetchLiveWeather({ location: locationInput.trim() });
      setActiveWeather(res.record);
      setIsFallback(res.is_fallback);
      if (res.is_fallback) {
        setAlert({ type: 'info', message: 'Open-Meteo API unreachable or returned fallback estimation. Switched to offline weather record.' });
      } else {
        setAlert({ type: 'success', message: `Live weather data fetched for '${res.record.location}' and saved in database.` });
      }
      fetchRecords();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch weather data. Showing manual entry option.' });
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
              {isManualMode ? 'Manual Weather Entry' : 'Live Open-Meteo Lookup'}
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsManualMode(!isManualMode)}
            >
              <Edit3 size={14} />
              {isManualMode ? 'Switch to Live Lookup' : 'Manual Entry'}
            </button>
          </div>

          {!isManualMode ? (
            <form onSubmit={handleFetchWeather}>
              <div className="form-group">
                <label className="form-label">City or Region Location *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. New Delhi, Punjab, London"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                <RefreshCw size={16} />
                {loading ? 'Querying Open-Meteo API...' : 'Fetch Live Weather'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label className="form-label">Location / Farm Station Name *</label>
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
                  <label className="form-label">Temperature (°C) *</label>
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
                  <label className="form-label">Humidity (%) *</label>
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
                  <label className="form-label">Rainfall (mm) *</label>
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
                  <label className="form-label">Wind Speed (km/h) *</label>
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
                <label className="form-label">Weather Condition Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Clear Sky, Moderate Rain"
                  value={manualData.weather_description}
                  onChange={(e) => setManualData({ ...manualData, weather_description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Saving Record...' : 'Save Weather Record'}
              </button>
            </form>
          )}
        </div>

        {/* Display Active Weather Card */}
        <div>
          {loading ? (
            <LoadingSpinner message="Retrieving climate data..." />
          ) : activeWeather ? (
            <WeatherCard weather={activeWeather} isLive={true} isFallback={isFallback} />
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Search for a location to view weather metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Weather Records */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} />
            Saved Weather Logs ({records.length})
          </h3>
        </div>

        {recordsLoading ? (
          <LoadingSpinner message="Loading weather logs..." />
        ) : records.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Temperature</th>
                  <th>Humidity</th>
                  <th>Rainfall</th>
                  <th>Wind Speed</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setActiveWeather(r)}>
                    <td>#{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.location}</td>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{r.temperature}°C</td>
                    <td>{r.humidity}%</td>
                    <td>{r.rainfall} mm</td>
                    <td>{r.wind_speed} km/h</td>
                    <td><span className="badge badge-info">{r.weather_description}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No saved weather records found.</p>
        )}
      </div>
    </div>
  );
}

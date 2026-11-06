import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { CategoryChart, StatusChart } from '../components/Charts';
import CropTable from '../components/CropTable';
import AdvisoryCard from '../components/AdvisoryCard';
import WeatherCard from '../components/WeatherCard';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Activity, TestTube2, CloudSun, Lightbulb, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      setError('Failed to load dashboard metrics from backend database. Make sure FastAPI server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) return <LoadingSpinner message="Fetching live dynamic dashboard stats..." />;
  if (error) return <AlertMessage type="error" message={error} onClose={() => setError('')} />;
  if (!data) return null;

  return (
    <div>
      {/* Stat Cards Grid */}
      <div className="grid-cols-4">
        <StatCard title={t('totalCrops')} value={data.total_crops} icon={Sprout} color="#16a34a" subtitle="Registered crops" />
        <StatCard title={t('activeCrops')} value={data.active_crops} icon={Activity} color="#0284c7" subtitle="Planned or growing" />
        <StatCard title={t('soilReports')} value={data.soil_reports} icon={TestTube2} color="#8b5cf6" subtitle="Soil tests analyzed" />
        <StatCard title={t('weatherRecords')} value={data.weather_records} icon={CloudSun} color="#eab308" subtitle="Climate logs recorded" />
        <StatCard title={t('totalAdvisories')} value={data.total_advisories} icon={Lightbulb} color="#10b981" subtitle="Generated advisories" />
        <StatCard title={t('highPriority')} value={data.high_priority_advisories} icon={ShieldAlert} color="#ef4444" subtitle="Urgent action required" />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('cropsByCategory')}</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryChart categoryData={data.crops_by_category} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('cropsByStatus')}</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StatusChart statusData={data.crops_by_status} />
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid-cols-2">
        {/* Recent Crops */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('recentCrops')}</h3>
          </div>
          {data.recent_crops && data.recent_crops.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('cropName')}</th>
                    <th>{t('category')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_crops.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.crop_name}</td>
                      <td>{c.category}</td>
                      <td><span className="badge badge-success">{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('noCrops')}</p>
          )}
        </div>

        {/* Recent Weather */}
        <div>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <h3 className="card-title">{t('latestWeather')}</h3>
          </div>
          {data.recent_weather && data.recent_weather.length > 0 ? (
            <WeatherCard weather={data.recent_weather[0]} />
          ) : (
            <div className="card"><p style={{ color: 'var(--text-muted)' }}>{t('noWeather')}</p></div>
          )}
        </div>
      </div>

      {/* Recent Advisories */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">{t('latestAdvisories')}</h3>
        </div>
        {data.recent_advisories && data.recent_advisories.length > 0 ? (
          <div>
            {data.recent_advisories.slice(0, 2).map((adv) => (
              <AdvisoryCard key={adv.id} advisory={adv} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>{t('noAdvisories')}</p>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { CloudSun, Thermometer, Droplets, CloudRain, Wind, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WeatherCard({ weather, isLive = false, isFallback = false }) {
  const { t } = useLanguage();
  if (!weather) return null;

  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="#93c5fd" />
          <span style={{ fontSize: '18px', fontWeight: 700 }}>{weather.location}</span>
        </div>
        {isLive && (
          <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
            {isFallback ? t('offlineBadge', 'Offline Simulation') : t('liveBadge', 'Live Open-Meteo')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{weather.temperature}°C</div>
          <div style={{ fontSize: '15px', color: '#bfdbfe', marginTop: '6px', fontWeight: 500 }}>
            {weather.weather_description}
          </div>
        </div>
        <CloudSun size={58} color="#fde047" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', color: '#bfdbfe' }}>
            <Droplets size={14} />
            {t('humidity')}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{weather.humidity}%</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', color: '#bfdbfe' }}>
            <CloudRain size={14} />
            {t('rainfall')}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{weather.rainfall} mm</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', color: '#bfdbfe' }}>
            <Wind size={14} />
            {t('windSpeed')}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{weather.wind_speed} km/h</div>
        </div>
      </div>
    </div>
  );
}

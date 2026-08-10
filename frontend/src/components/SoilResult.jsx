import React from 'react';
import { TestTube2, CheckCircle2, AlertTriangle, Droplets, Leaf } from 'lucide-react';

export default function SoilResult({ report, analysis }) {
  if (!report || !analysis) return null;

  const getConditionColor = (cond) => {
    if (cond.includes('Optimal') || cond === 'Medium' || cond === 'High' || cond === 'Neutral') return '#16a34a';
    if (cond.includes('Slightly') || cond === 'Low') return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="card" style={{ borderLeft: `6px solid ${getConditionColor(analysis.overall_condition)}` }}>
      <div className="card-header">
        <h3 className="card-title">
          <TestTube2 size={20} color="var(--primary)" />
          Soil Analysis Results — {report.location}
        </h3>
        <span
          className="badge"
          style={{
            backgroundColor: `${getConditionColor(analysis.overall_condition)}20`,
            color: getConditionColor(analysis.overall_condition),
            fontSize: '13px',
            padding: '6px 14px'
          }}
        >
          {analysis.overall_condition}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>pH Value</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: getConditionColor(analysis.ph_condition) }}>{report.ph}</div>
          <div style={{ fontSize: '12px', fontWeight: 600 }}>{analysis.ph_condition}</div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Nitrogen (N)</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{report.nitrogen} <span style={{ fontSize: '11px' }}>mg/kg</span></div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: getConditionColor(analysis.nitrogen_condition) }}>{analysis.nitrogen_condition}</div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Phosphorus (P)</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{report.phosphorus} <span style={{ fontSize: '11px' }}>mg/kg</span></div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: getConditionColor(analysis.phosphorus_condition) }}>{analysis.phosphorus_condition}</div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Potassium (K)</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{report.potassium} <span style={{ fontSize: '11px' }}>mg/kg</span></div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: getConditionColor(analysis.potassium_condition) }}>{analysis.potassium_condition}</div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Moisture</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{report.moisture}%</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: getConditionColor(analysis.moisture_condition) }}>{analysis.moisture_condition}</div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Leaf size={16} color="var(--primary)" />
          Actionable Soil Suggestions & Fertilizer Guidance
        </h4>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {analysis.suggestions.map((sug, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

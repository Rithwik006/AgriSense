import React from 'react';
import { AlertCircle, Lightbulb, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export default function AdvisoryCard({ advisory }) {
  if (!advisory) return null;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <span className="badge badge-danger"><ShieldAlert size={12} /> High Priority</span>;
      case 'Medium': return <span className="badge badge-warning"><AlertCircle size={12} /> Medium Priority</span>;
      case 'Low': return <span className="badge badge-success"><CheckCircle size={12} /> Normal / Low</span>;
      default: return <span className="badge badge-neutral">{priority}</span>;
    }
  };

  const getBorderColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return 'var(--border-color)';
    }
  };

  return (
    <div className="card" style={{ borderLeft: `5px solid ${getBorderColor(advisory.priority)}`, marginBottom: '16px' }}>
      <div className="card-header" style={{ marginBottom: '12px' }}>
        <h4 className="card-title" style={{ fontSize: '17px', color: 'var(--primary-dark)' }}>
          <Lightbulb size={18} color="var(--primary)" />
          Target Crop: {advisory.crop_name}
        </h4>
        {getPriorityBadge(advisory.priority)}
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
          Actionable Recommendation
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.5 }}>
          {advisory.recommendation}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '12px' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Soil Matrix: </span>
          <span style={{ fontWeight: 500 }}>{advisory.soil_condition}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Weather Matrix: </span>
          <span style={{ fontWeight: 500 }}>{advisory.weather_condition}</span>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
        <strong style={{ color: 'var(--text-main)' }}>Scientific Reason: </strong>
        {advisory.reason}
      </div>
    </div>
  );
}

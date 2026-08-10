import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'var(--primary)', subtitle }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

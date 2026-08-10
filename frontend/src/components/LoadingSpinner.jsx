import React from 'react';

export default function LoadingSpinner({ message = "Loading data..." }) {
  return (
    <div className="spinner-container">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{message}</p>
      </div>
    </div>
  );
}

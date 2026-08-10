import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function AlertMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle size={18} />;
      case 'success': return <CheckCircle2 size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      {getIcon()}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
        >
          ×
        </button>
      )}
    </div>
  );
}

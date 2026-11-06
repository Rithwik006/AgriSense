import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, currentLangObj } = useLanguage();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: compact ? '4px 8px' : '6px 10px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Globe size={16} color="var(--primary)" style={{ marginRight: '6px', flexShrink: 0 }} />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-main)',
            cursor: 'pointer',
            paddingRight: '4px'
          }}
          aria-label="Select Language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

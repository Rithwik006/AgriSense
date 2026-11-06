import React, { useState, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = ['Cereal', 'Vegetable', 'Fruit', 'Cash Crop', 'Pulse', 'Oilseed'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year Round'];
const STATUSES = ['Planned', 'Growing', 'Harvested', 'Completed'];

export default function CropForm({ initialData = null, onSubmit, onCancel, isLoading }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    crop_name: '',
    category: 'Cereal',
    season: 'Kharif',
    area: '',
    planting_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: '',
    status: 'Planned',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        crop_name: initialData.crop_name || '',
        category: initialData.category || 'Cereal',
        season: initialData.season || 'Kharif',
        area: initialData.area || '',
        planting_date: initialData.planting_date || '',
        expected_harvest_date: initialData.expected_harvest_date || '',
        status: initialData.status || 'Planned',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.crop_name.trim()) {
      setError('Crop Name is required.');
      return;
    }
    if (!formData.area || parseFloat(formData.area) <= 0) {
      setError('Area must be greater than 0.');
      return;
    }
    if (!formData.planting_date || !formData.expected_harvest_date) {
      setError('Planting and expected harvest dates are required.');
      return;
    }
    if (new Date(formData.expected_harvest_date) < new Date(formData.planting_date)) {
      setError('Expected harvest date cannot be earlier than planting date.');
      return;
    }

    onSubmit({
      ...formData,
      crop_name: formData.crop_name.trim(),
      area: parseFloat(formData.area)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label">{t('cropName')} *</label>
          <VoiceInput
            inline
            onTranscript={(text) => setFormData((prev) => ({ ...prev, crop_name: text }))}
          />
        </div>
        <input
          type="text"
          name="crop_name"
          className="form-input"
          placeholder="e.g. Wheat, Rice, Tomato, Cotton"
          value={formData.crop_name}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">{t('category')} *</label>
          <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('season')} *</label>
          <select name="season" className="form-select" value={formData.season} onChange={handleChange}>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">{t('areaAcres')} *</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            name="area"
            className="form-input"
            placeholder="e.g. 5.5"
            value={formData.area}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('status')} *</label>
          <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">{t('plantingDate')} *</label>
          <input
            type="date"
            name="planting_date"
            className="form-input"
            value={formData.planting_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('expectedHarvest')} *</label>
          <input
            type="date"
            name="expected_harvest_date"
            className="form-input"
            value={formData.expected_harvest_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label">{t('notes')}</label>
          <VoiceInput
            inline
            onTranscript={(text) => setFormData((prev) => ({
              ...prev,
              notes: prev.notes ? `${prev.notes} ${text}` : text
            }))}
          />
        </div>
        <textarea
          name="notes"
          rows={3}
          className="form-input"
          placeholder="Field observations, pest treatment logs, fertilizer schedules..."
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          {t('cancel')}
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : t('saveCrop')}
        </button>
      </div>
    </form>
  );
}

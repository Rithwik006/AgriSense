import React, { useState, useEffect } from 'react';
import { getCrops, createCrop, updateCrop, deleteCrop } from '../services/api';
import CropTable from '../components/CropTable';
import CropForm from '../components/CropForm';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import VoiceInput from '../components/VoiceInput';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, Filter, ArrowUpDown, Sprout } from 'lucide-react';

export default function CropManager() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deletingCropId, setDeletingCropId] = useState(null);

  const fetchCropsData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (seasonFilter) params.season = seasonFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await getCrops(params);

      // Client-side sorting
      let sorted = [...data];
      if (sortBy === 'name') {
        sorted.sort((a, b) => a.crop_name.localeCompare(b.crop_name));
      } else if (sortBy === 'area') {
        sorted.sort((a, b) => b.area - a.area);
      } else if (sortBy === 'oldest') {
        sorted.sort((a, b) => a.id - b.id);
      } else {
        sorted.sort((a, b) => b.id - a.id);
      }

      setCrops(sorted);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch crop records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCropsData();
  }, [search, categoryFilter, seasonFilter, statusFilter, sortBy]);

  const handleCreate = async (formData) => {
    try {
      setSubmitting(true);
      await createCrop(formData);
      setAlert({ type: 'success', message: `Crop '${formData.crop_name}' created successfully.` });
      setIsAddModalOpen(false);
      fetchCropsData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.detail || 'Failed to create crop.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setSubmitting(true);
      await updateCrop(editingCrop.id, formData);
      setAlert({ type: 'success', message: `Crop '${formData.crop_name}' updated successfully.` });
      setEditingCrop(null);
      fetchCropsData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.detail || 'Failed to update crop.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCropId) return;
    try {
      setSubmitting(true);
      await deleteCrop(deletingCropId);
      setAlert({ type: 'success', message: 'Crop record deleted successfully.' });
      setDeletingCropId(null);
      fetchCropsData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete crop record.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Top Controls Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box with Voice Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('searchCrops')}
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <VoiceInput
                inline
                onTranscript={(text) => setSearch(text)}
              />
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-select" style={{ width: '130px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">{t('allCategories')}</option>
              <option value="Cereal">Cereal</option>
              <option value="Vegetable">Vegetable</option>
              <option value="Fruit">Fruit</option>
              <option value="Cash Crop">Cash Crop</option>
              <option value="Pulse">Pulse</option>
              <option value="Oilseed">Oilseed</option>
            </select>

            <select className="form-select" style={{ width: '130px' }} value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
              <option value="">{t('allSeasons')}</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
              <option value="Year Round">Year Round</option>
            </select>

            <select className="form-select" style={{ width: '130px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{t('allStatuses')}</option>
              <option value="Planned">Planned</option>
              <option value="Growing">Growing</option>
              <option value="Harvested">Harvested</option>
              <option value="Completed">Completed</option>
            </select>

            <select className="form-select" style={{ width: '150px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="area">Sort: Area (Largest)</option>
            </select>

            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} />
              {t('addCrop')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Sprout size={20} color="var(--primary)" />
            {t('manageCrops')}
          </h3>
          <span className="badge badge-success">{crops.length} crops listed</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching crop records..." />
        ) : (
          <CropTable
            crops={crops}
            onEdit={(crop) => setEditingCrop(crop)}
            onDelete={(id) => setDeletingCropId(id)}
          />
        )}
      </div>

      {/* Add Crop Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addCrop')}
      >
        <CropForm
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>

      {/* Edit Crop Modal */}
      <Modal
        isOpen={!!editingCrop}
        onClose={() => setEditingCrop(null)}
        title={t('editCrop')}
      >
        {editingCrop && (
          <CropForm
            initialData={editingCrop}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCrop(null)}
            isLoading={submitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCropId}
        onClose={() => setDeletingCropId(null)}
        title={t('deleteCrop')}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: 'var(--text-main)', marginBottom: '20px' }}>
            {t('confirmDelete')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setDeletingCropId(null)} disabled={submitting}>
              {t('cancel')}
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={submitting}>
              {submitting ? 'Deleting...' : t('deleteCrop')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

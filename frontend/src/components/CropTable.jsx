import React from 'react';
import { Edit2, Trash2, Calendar, MapPin } from 'lucide-react';

export default function CropTable({ crops, onEdit, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Growing': return <span className="badge badge-success">Growing</span>;
      case 'Planned': return <span className="badge badge-info">Planned</span>;
      case 'Harvested': return <span className="badge badge-warning">Harvested</span>;
      case 'Completed': return <span className="badge badge-neutral">Completed</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (!crops || crops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        No crop records found matching your filters.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Crop Name</th>
            <th>Category</th>
            <th>Season</th>
            <th>Area (Acres)</th>
            <th>Planting Date</th>
            <th>Expected Harvest</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {crops.map((crop) => (
            <tr key={crop.id}>
              <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{crop.id}</td>
              <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{crop.crop_name}</td>
              <td><span className="badge badge-neutral">{crop.category}</span></td>
              <td>{crop.season}</td>
              <td>{crop.area} acres</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  {crop.planting_date}
                </div>
              </td>
              <td>{crop.expected_harvest_date}</td>
              <td>{getStatusBadge(crop.status)}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(crop)}
                    title="Edit Crop"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(crop.id)}
                    title="Delete Crop"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

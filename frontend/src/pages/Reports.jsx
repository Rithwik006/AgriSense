import React, { useState, useEffect } from 'react';
import { getDashboardData, getExportUrl } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { CategoryChart, StatusChart } from '../components/Charts';
import { FileSpreadsheet, Download, FileText, FileCode, CheckCircle2, Sprout, TestTube2, CloudSun, Lightbulb } from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      setError('Failed to load database reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleDownload = (exportType, filename) => {
    const url = getExportUrl(exportType);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner message="Generating real-time reports from database..." />;
  if (error) return <AlertMessage type="error" message={error} onClose={() => setError('')} />;
  if (!data) return null;

  return (
    <div>
      {/* Export Action Toolbar */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <h3 className="card-title" style={{ color: 'var(--primary-dark)' }}>
            <FileSpreadsheet size={20} color="var(--primary)" />
            Data Export Engine (CSV / JSON / TXT)
          </h3>
          <span className="badge badge-success">Python File Manager Utility Active</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => handleDownload('crops/csv', 'agrisense_crops.csv')}>
            <Download size={15} color="#16a34a" /> Export Crops CSV
          </button>

          <button className="btn btn-secondary" onClick={() => handleDownload('soil/csv', 'agrisense_soil_reports.csv')}>
            <Download size={15} color="#8b5cf6" /> Export Soil CSV
          </button>

          <button className="btn btn-secondary" onClick={() => handleDownload('weather/csv', 'agrisense_weather_records.csv')}>
            <Download size={15} color="#eab308" /> Export Weather CSV
          </button>

          <button className="btn btn-secondary" onClick={() => handleDownload('advisories/csv', 'agrisense_advisories.csv')}>
            <Download size={15} color="#0284c7" /> Export Advisories CSV
          </button>

          <button className="btn btn-primary" onClick={() => handleDownload('all/json', 'agrisense_full_report.json')}>
            <FileCode size={15} /> Export Complete JSON
          </button>

          <button className="btn btn-primary" style={{ backgroundColor: '#14532d' }} onClick={() => handleDownload('summary/txt', 'agrisense_summary.txt')}>
            <FileText size={15} /> Export Summary TXT
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-cols-4">
        <StatCard title="Total Crops" value={data.total_crops} icon={Sprout} color="#16a34a" />
        <StatCard title="Soil Records" value={data.soil_reports} icon={TestTube2} color="#8b5cf6" />
        <StatCard title="Weather Logs" value={data.weather_records} icon={CloudSun} color="#eab308" />
        <StatCard title="Total Advisories" value={data.total_advisories} icon={Lightbulb} color="#10b981" />
      </div>

      {/* Analytical Charts */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Crops by Category Breakdown</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryChart categoryData={data.crops_by_category} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Crops by Status Summary</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StatusChart statusData={data.crops_by_status} />
          </div>
        </div>
      </div>

      {/* Structured Reports Tables */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Database System Status & Record Metrics</h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data Module</th>
                <th>Database Table</th>
                <th>Total Records</th>
                <th>Health Status</th>
                <th>Export Format</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700 }}>Crop Management</td>
                <td>crops</td>
                <td style={{ fontWeight: 700 }}>{data.total_crops}</td>
                <td><span className="badge badge-success"><CheckCircle2 size={12} /> Active</span></td>
                <td>CSV, JSON, TXT</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>Soil Health Analyzer</td>
                <td>soil_reports</td>
                <td style={{ fontWeight: 700 }}>{data.soil_reports}</td>
                <td><span className="badge badge-success"><CheckCircle2 size={12} /> Active</span></td>
                <td>CSV, JSON, TXT</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>Weather Integration</td>
                <td>weather_records</td>
                <td style={{ fontWeight: 700 }}>{data.weather_records}</td>
                <td><span className="badge badge-success"><CheckCircle2 size={12} /> Active</span></td>
                <td>CSV, JSON, TXT</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>Advisory Engine</td>
                <td>advisories</td>
                <td style={{ fontWeight: 700 }}>{data.total_advisories}</td>
                <td><span className="badge badge-success"><CheckCircle2 size={12} /> Active</span></td>
                <td>CSV, JSON, TXT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

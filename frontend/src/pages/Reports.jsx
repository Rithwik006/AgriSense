import React, { useState, useEffect } from 'react';
import { getDashboardData, downloadReportBlob, getExportUrl } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { CategoryChart, StatusChart } from '../components/Charts';
import { useLanguage } from '../context/LanguageContext';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCode,
  Printer,
  Sprout,
  TestTube2,
  CloudSun,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export default function Reports() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleDownload = async (exportType, filename) => {
    try {
      setExporting(true);
      setSuccessMsg('');
      await downloadReportBlob(exportType, filename);
      setSuccessMsg(`File '${filename}' exported and downloaded successfully.`);
    } catch (err) {
      // Fallback to direct URL if blob stream encounters any issue
      try {
        const url = getExportUrl(exportType);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSuccessMsg(`File '${filename}' downloaded.`);
      } catch (e2) {
        setError(`Failed to export ${filename}: ${err.message}`);
      }
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Generating real-time reports from database..." />;
  if (error) return <AlertMessage type="error" message={error} onClose={() => setError('')} />;
  if (!data) return null;

  return (
    <div>
      {successMsg && (
        <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
      )}

      {/* Export Action Toolbar */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <h3 className="card-title" style={{ color: 'var(--primary-dark)' }}>
            <FileSpreadsheet size={20} color="var(--primary)" />
            {t('exportToolbar')}
          </h3>
          <span className="badge badge-success">Python Data Engine Ready</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            disabled={exporting}
            onClick={() => handleDownload('crops/csv', 'agrisense_crops.csv')}
          >
            <Download size={15} color="#16a34a" /> {t('exportCropsCsv')}
          </button>

          <button
            className="btn btn-secondary"
            disabled={exporting}
            onClick={() => handleDownload('soil/csv', 'agrisense_soil_reports.csv')}
          >
            <Download size={15} color="#8b5cf6" /> {t('exportSoilCsv')}
          </button>

          <button
            className="btn btn-secondary"
            disabled={exporting}
            onClick={() => handleDownload('weather/csv', 'agrisense_weather_records.csv')}
          >
            <Download size={15} color="#eab308" /> {t('exportWeatherCsv')}
          </button>

          <button
            className="btn btn-secondary"
            disabled={exporting}
            onClick={() => handleDownload('advisories/csv', 'agrisense_advisories.csv')}
          >
            <Download size={15} color="#0284c7" /> {t('exportAdvisoriesCsv')}
          </button>

          <button
            className="btn btn-primary"
            disabled={exporting}
            onClick={() => handleDownload('all/json', 'agrisense_full_report.json')}
          >
            <FileCode size={15} /> {t('exportAllJson')}
          </button>

          <button
            className="btn btn-primary"
            style={{ backgroundColor: '#14532d' }}
            disabled={exporting}
            onClick={() => handleDownload('summary/txt', 'agrisense_summary.txt')}
          >
            <FileText size={15} /> {t('exportSummaryTxt')}
          </button>

          <button
            className="btn btn-secondary"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            onClick={handlePrint}
          >
            <Printer size={15} /> {t('printReport')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-cols-4">
        <StatCard title={t('totalCrops')} value={data.total_crops} icon={Sprout} color="#16a34a" />
        <StatCard title={t('soilReports')} value={data.soil_reports} icon={TestTube2} color="#8b5cf6" />
        <StatCard title={t('weatherRecords')} value={data.weather_records} icon={CloudSun} color="#eab308" />
        <StatCard title={t('totalAdvisories')} value={data.total_advisories} icon={Lightbulb} color="#10b981" />
      </div>

      {/* Analytical Charts */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('cropsByCategory')}</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryChart categoryData={data.crops_by_category} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('cropsByStatus')}</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StatusChart statusData={data.crops_by_status} />
          </div>
        </div>
      </div>

      {/* Data Summary Tables */}
      <div className="grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('recentCrops')}</h3>
          </div>
          {data.recent_crops && data.recent_crops.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('cropName')}</th>
                    <th>{t('category')}</th>
                    <th>{t('areaAcres')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_crops.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.crop_name}</td>
                      <td>{c.category}</td>
                      <td>{c.area}</td>
                      <td><span className="badge badge-success">{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>{t('noCrops')}</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('soilHistory')}</h3>
          </div>
          {data.recent_soil_reports && data.recent_soil_reports.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('fieldLocation')}</th>
                    <th>pH</th>
                    <th>N-P-K</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_soil_reports.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.location}</td>
                      <td>{s.ph}</td>
                      <td>{s.nitrogen}-{s.phosphorus}-{s.potassium}</td>
                      <td><span className="badge badge-primary">{s.overall_condition}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No soil tests recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

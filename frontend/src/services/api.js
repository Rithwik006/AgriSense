import axios from 'axios';

// Centralized API Base URL (configured for both dev proxy and production deployment)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrisense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Crops Service
export const getCrops = async (params = {}) => {
  const response = await api.get('/crops', { params });
  return response.data;
};

export const createCrop = async (cropData) => {
  const response = await api.post('/crops', cropData);
  return response.data;
};

export const updateCrop = async (id, cropData) => {
  const response = await api.put(`/crops/${id}`, cropData);
  return response.data;
};

export const deleteCrop = async (id) => {
  const response = await api.delete(`/crops/${id}`);
  return response.data;
};

// Soil Service
export const analyzeSoil = async (soilData) => {
  const response = await api.post('/soil/analyze', soilData);
  return response.data;
};

export const getSoilReports = async () => {
  const response = await api.get('/soil/reports');
  return response.data;
};

// Weather Service
export const getWeatherRecords = async () => {
  const response = await api.get('/weather');
  return response.data;
};

export const fetchLiveWeather = async (locationData) => {
  const response = await api.post('/weather/fetch', locationData);
  return response.data;
};

export const saveManualWeather = async (weatherData) => {
  const response = await api.post('/weather/manual', weatherData);
  return response.data;
};

// Advisory Service
export const generateAdvisory = async (advisoryData) => {
  const response = await api.post('/advisory/generate', advisoryData);
  return response.data;
};

export const getAdvisories = async () => {
  const response = await api.get('/advisory');
  return response.data;
};

// Reports & Dashboard Service
export const getDashboardData = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

export const getExportUrl = (exportType) => {
  return `${API_BASE_URL}/reports/${exportType}`;
};

export const downloadReportBlob = async (exportType, filename) => {
  const response = await api.get(`/reports/${exportType}`, { responseType: 'blob' });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;

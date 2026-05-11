import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── CREATE ────────────────────────────────────────────────────────────────────
export const createPortfolioFromForm   = (data) => API.post('/portfolio/from-form', data);
export const createPortfolioFromResume = (formData) =>
  API.post('/portfolio/from-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ─── READ ──────────────────────────────────────────────────────────────────────
export const getUserPortfolios   = ()     => API.get('/portfolio');
export const getPortfolioById    = (id)   => API.get(`/portfolio/${id}`);
export const getPortfolioBySlug  = (slug) => API.get(`/portfolio/view/${slug}`);
export const getPortfolioStats   = ()     => API.get('/portfolio/stats');
export const analyzePortfolioUrl = (url) => API.post('/portfolio/analyze-url', { url });

// ─── ANALYZE ──────────────────────────────────────────────────────────────────
export const analyzePortfolio = (id) => API.post(`/portfolio/${id}/analyze`);

// ─── UPDATE / DELETE ──────────────────────────────────────────────────────────
export const updatePortfolio = (id, data)  => API.put(`/portfolio/${id}`, data);
export const deletePortfolio = (id)        => API.delete(`/portfolio/${id}`);
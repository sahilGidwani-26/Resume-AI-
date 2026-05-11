import axios from 'axios';

const API = axios.create({
  baseURL: 'https://resume-ai-2-91mv.onrender.com/api',
  timeout: 60000, // 60s for AI calls
});

// Attach JWT token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ─── Resume ───────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    API.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => API.get('/resume'),
  getById: (id) => API.get(`/resume/${id}`),
  delete: (id) => API.delete(`/resume/${id}`),
};

// ─── Jobs ────────────────────────────────────────────
export const jobAPI = {
  getRecommendations: () => API.get('/jobs/recommendations'),
  search: (data) => API.post('/jobs/search', data),
};

// ─── User ─────────────────────────────────────────────
export const userAPI = {
  getDashboard: () => API.get('/user/dashboard'),
  updateProfile: (data) => API.put('/user/profile', data),
  saveResumeBuilder: (data) => API.post('/user/resume-builder', data),
  getResumeBuilder: (id) => API.get(`/user/resume-builder/${id}`),
  getAllBuiltResumes: () => API.get('/user/resume-builder'),
};

export default API;
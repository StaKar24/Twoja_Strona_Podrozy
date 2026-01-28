import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Instancja axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatyczne dodawanie tokenu do requestów
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auth
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// trips
export const trips = {
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
};

// segments
export const segments = {
  getByTrip: (tripId) => api.get(`/segments/trip/${tripId}`),
  getById: (id) => api.get(`/segments/${id}`),
  create: (data) => api.post('/segments', data),
  update: (id, data) => api.put(`/segments/${id}`, data),
  delete: (id) => api.delete(`/segments/${id}`),
};

// comments
export const comments = {
  getBySegment: (segmentId) => api.get(`/comments/segment/${segmentId}`),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

//suggestions
export const suggestions = {
  getAll: () => api.get('/suggestions'),
  getById: (id) => api.get(`/suggestions/${id}`),
  create: (data) => api.post('/suggestions', data),
  updateStatus: (id, status) => api.put(`/suggestions/${id}/status`, { status }),
  delete: (id) => api.delete(`/suggestions/${id}`),
};

export default api;
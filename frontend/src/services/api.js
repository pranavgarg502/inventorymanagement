import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Assets ──────────────────────────────────────────────
export const getAssets = (params = {}) => api.get('/assets', { params });
export const getAsset = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);

// ── Users ────────────────────────────────────────────────
export const getUsers = (params = {}) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);

// ── Assignments ──────────────────────────────────────────
export const getAssignments = (params = {}) => api.get('/assignments', { params });
export const assignAsset = (data) => api.post('/assignments/assign', data);
export const returnAsset = (data) => api.post('/assignments/return', data);
export const transferAsset = (data) => api.post('/assignments/transfer', data);

// ── Maintenance ──────────────────────────────────────────
export const getLogs = (params = {}) => api.get('/maintenance', { params });
export const createLog = (data) => api.post('/maintenance', data);
export const updateLog = (id, data) => api.put(`/maintenance/${id}`, data);

// ── Dashboard ────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');

export default api;

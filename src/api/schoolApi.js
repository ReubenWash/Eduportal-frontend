import api from './axios';

// Mock data for offline/development fallback
const MOCK_SCHOOL_DATA = {
  name: 'Greenfield Academy',
  email: 'admin@greenfield.edu.gh',
  phone: '+233 20 000 0000',
  address: 'P.O. Box 123, Accra, Ghana',
  logo: '',
  plan: 'PRO',
  createdAt: '2024-01-01',
};

const MOCK_TERMS = [
  { id: 't1', name: 'First Term 2025', startDate: '2025-01-10', endDate: '2025-04-10', status: 'COMPLETED' },
  { id: 't2', name: 'Second Term 2025', startDate: '2025-04-24', endDate: '2025-08-01', status: 'ACTIVE' },
  { id: 't3', name: 'Third Term 2025', startDate: '2025-09-01', endDate: '2025-12-15', status: 'UPCOMING' },
];

export const getSchool = async () => {
  try { const res = await api.get('/schools/me'); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_SCHOOL_DATA), 300)); }
};
export const updateSchool = async (data) => {
  try { const res = await api.patch('/schools/me', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 'school_mock' }), 300)); }
};
export const getSchoolTerms = async () => {
  try { const res = await api.get('/schools/me/terms'); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_TERMS), 300)); }
};
export const createTerm = async (data) => {
  try { const res = await api.post('/schools/me/terms', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 't_' + Date.now() }), 300)); }
};
export const updateTerm = async (id, data) => {
  try { const res = await api.patch(`/schools/me/terms/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id }), 300)); }
};

// Super Admin endpoints
export const getAllSchools = async (params) => {
  try { const res = await api.get('/schools', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve([]), 300)); }
};
export const updateSchoolStatus = async (id, status) => {
  try { const res = await api.patch(`/schools/${id}/status`, { status }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
import api from './axios';

// Mock data for offline/development fallback
const MOCK_STAFF = [
  { id: 's1', name: 'Mr. Kofi Mensah', email: 'kofi@school.com', role: 'CLASS_TEACHER', phone: '+233 20 111 1111', subjects: ['Mathematics'], createdAt: '2024-09-01' },
  { id: 's2', name: 'Ms. Ama Asante', email: 'ama@school.com', role: 'SUBJECT_TEACHER', phone: '+233 20 222 2222', subjects: ['English'], createdAt: '2024-09-01' },
  { id: 's3', name: 'Mrs. Abena Mensah', email: 'abena@school.com', role: 'SUBJECT_TEACHER', phone: '+233 20 333 3333', subjects: ['Science'], createdAt: '2024-09-05' },
  { id: 's4', name: 'Mr. Kwame Boateng', email: 'kwame@school.com', role: 'CLASS_TEACHER', phone: '+233 20 444 4444', subjects: ['Social Studies'], createdAt: '2024-09-10' },
];

export const getStaff = async (params) => {
  try { const res = await api.get('/staff', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_STAFF), 300)); }
};
export const createStaff = async (data) => {
  try { const res = await api.post('/staff', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 's_' + Date.now(), createdAt: new Date().toISOString() }), 300)); }
};
export const updateStaff = async (id, data) => {
  try { const res = await api.patch(`/staff/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id }), 300)); }
};
export const deleteStaff = async (id) => {
  try { const res = await api.delete(`/staff/${id}`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const assignSubjects = async (id, data) => {
  try { const res = await api.post(`/staff/${id}/assign`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
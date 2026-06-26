import api from './axios';

// Mock data for offline/development fallback
const MOCK_GUARDIANS = [
  { id: 'g1', name: 'Jane Doe', email: 'jane@example.com', phone: '+233 24 000 0001', address: 'Accra, Ghana', students: [{ id: 'stu1', name: 'Ama Mensah' }] },
  { id: 'g2', name: 'Kwame Asante Snr.', email: 'kwame.snr@example.com', phone: '+233 24 000 0002', address: 'Kumasi, Ghana', students: [{ id: 'stu4', name: 'Kwame Asante' }] },
];

export const getGuardians = async (params) => {
  try { const res = await api.get('/guardians', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_GUARDIANS), 300)); }
};
export const createGuardian = async (data) => {
  try { const res = await api.post('/guardians', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 'g_' + Date.now(), students: [] }), 300)); }
};
export const updateGuardian = async (id, data) => {
  try { const res = await api.patch(`/guardians/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id }), 300)); }
};
export const linkStudent = async (id, data) => {
  try { const res = await api.post(`/guardians/${id}/link`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
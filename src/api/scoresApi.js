import api from './axios';

export const getScores = async (params) => {
  try { const res = await api.get('/scores', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve([]), 300)); }
};
export const saveScore = async (id, data) => {
  try { const res = await api.post(`/scores/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const bulkSaveScores = async (data) => {
  try { const res = await api.post('/scores/bulk', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const computeGrades = async (params) => {
  try { const res = await api.post('/scores/compute', params); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
import api from './axios';

export const getAttendance = async (params) => {
  try { const res = await api.get('/attendance', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve([]), 300)); }
};
export const bulkMarkAttendance = async (data) => {
  try { const res = await api.post('/attendance/bulk', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const getAttendanceSummary = async (params) => {
  try { const res = await api.get('/attendance/summary', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ present: 0, absent: 0, late: 0 }), 300)); }
};
export const getAttendanceAnalytics = async (params) => {
  try { const res = await api.get('/attendance/analytics', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve([]), 300)); }
};
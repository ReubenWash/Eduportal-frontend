import api from './axios';

export const getReportPreview = async (id) => {
  try { const res = await api.get(`/reports/${id}/preview`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ url: '' }), 300)); }
};
export const generateReports = async (data) => {
  try { const res = await api.post('/reports/generate', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true, count: 0 }), 300)); }
};
export const approveReport = async (id) => {
  try { const res = await api.post(`/reports/${id}/approve`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const releaseBulkReports = async (data) => {
  try { const res = await api.post('/reports/release-bulk', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const sendReportEmail = async (id, data) => {
  try { const res = await api.post(`/reports/${id}/email`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
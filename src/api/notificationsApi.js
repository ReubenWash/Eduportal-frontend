import api from './axios';

export const getNotifications = async (params) => {
  try { const res = await api.get('/notifications', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve([]), 300)); }
};
export const markNotificationRead = async (id) => {
  try { const res = await api.post(`/notifications/${id}/read`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
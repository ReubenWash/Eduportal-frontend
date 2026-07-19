import api, { unwrapList, unwrapItem } from './axios';

// GET /notifications
export const getNotifications = async (params) => {
  const res = await api.get('/notifications', { params });
  return unwrapList(res.data);
};

// PATCH /notifications/:id/read
export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return unwrapItem(res.data);
};

// POST /notifications/read-all
export const markAllNotificationsRead = async () => {
  const res = await api.post('/notifications/read-all');
  return unwrapItem(res.data);
};

// DELETE /notifications/:id
export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return unwrapItem(res.data);
};

// POST /notifications/broadcast  (admin)
export const broadcastNotification = async (data) => {
  const res = await api.post('/notifications/broadcast', data);
  return unwrapItem(res.data);
};
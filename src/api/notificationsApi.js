import api, { unwrapList, unwrapItem } from './axios';

export const getNotifications = async (params) => {
  const res = await api.get('/notifications', { params });
  return unwrapList(res.data);
};
export const markNotificationRead = async (id) => {
  const res = await api.post(`/notifications/${id}/read`);
  return unwrapItem(res.data);
};
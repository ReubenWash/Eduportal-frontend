import api, { unwrapItem } from './axios';

export const getActivityLogs = async (params = {}) => {
  const response = await api.get('/activity-logs', { params });
  return unwrapItem(response.data);
};

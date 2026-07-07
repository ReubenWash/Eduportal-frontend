import api, { unwrapList, unwrapItem } from './axios';

export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return unwrapList(res.data);
};
export const bulkMarkAttendance = async (data) => {
  const res = await api.post('/attendance/bulk', data);
  return unwrapItem(res.data);
};
export const getAttendanceSummary = async (params) => {
  const res = await api.get('/attendance/summary', { params });
  return unwrapItem(res.data);
};
export const getAttendanceAnalytics = async (params) => {
  const res = await api.get('/attendance/analytics', { params });
  return unwrapList(res.data);
};
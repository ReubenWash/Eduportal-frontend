import api, { unwrapList, unwrapItem } from './axios';

// GET /attendance
export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return unwrapList(res.data);
};

// GET /attendance/summary
export const getAttendanceSummary = async (params) => {
  const res = await api.get('/attendance/summary', { params });
  return unwrapItem(res.data);
};

// GET /attendance/analytics
export const getAttendanceAnalytics = async (params) => {
  const res = await api.get('/attendance/analytics', { params });
  return unwrapList(res.data);
};

// POST /attendance  (single record)
export const markAttendance = async (data) => {
  const res = await api.post('/attendance', data);
  return unwrapItem(res.data);
};

// POST /attendance/bulk
export const bulkMarkAttendance = async (data) => {
  const res = await api.post('/attendance/bulk', data);
  return unwrapItem(res.data);
};

// PATCH /attendance/:id
export const updateAttendance = async (id, data) => {
  const res = await api.patch(`/attendance/${id}`, data);
  return unwrapItem(res.data);
};
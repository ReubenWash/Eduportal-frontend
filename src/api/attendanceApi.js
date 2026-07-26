// frontend/src/api/attendanceApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── LIST ──────────────────────────────────────────────────────
export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return unwrapList(res.data);
};

export const getAttendanceSummary = async (params) => {
  const res = await api.get('/attendance/summary', { params });
  return unwrapItem(res.data);
};

export const getAttendanceAnalytics = async (params) => {
  const res = await api.get('/attendance/analytics', { params });
  return unwrapList(res.data);
};

// ─── MARK ──────────────────────────────────────────────────────
export const markAttendance = async (data) => {
  const res = await api.post('/attendance', data);
  return unwrapItem(res.data);
};

export const bulkMarkAttendance = async (data) => {
  const res = await api.post('/attendance/bulk', data);
  return unwrapItem(res.data);
};

// ─── UPDATE ────────────────────────────────────────────────────
export const updateAttendance = async (id, data) => {
  const res = await api.patch(`/attendance/${id}`, data);
  return unwrapItem(res.data);
};
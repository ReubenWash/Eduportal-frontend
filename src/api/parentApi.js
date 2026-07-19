import api, { unwrapList, unwrapItem } from './axios';
import { normalizeStudent } from './studentsApi';

// GET /guardians/me/children
export const getMyChildren = async () => {
  const res = await api.get('/guardians/me/children');
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeStudent) : [];
};

// GET /guardians/me/children/:studentId/report-cards
export const getChildReportCards = async (studentId) => {
  const res = await api.get(`/guardians/me/children/${studentId}/report-cards`);
  return unwrapList(res.data);
};

// GET /guardians/me/children/:studentId/grades
export const getChildGrades = async (studentId, params) => {
  const res = await api.get(`/guardians/me/children/${studentId}/grades`, { params });
  return unwrapList(res.data);
};

// GET /guardians/me/children/:studentId/attendance-summary
export const getChildAttendance = async (studentId, params) => {
  const res = await api.get(`/guardians/me/children/${studentId}/attendance-summary`, { params });
  return unwrapItem(res.data);
};
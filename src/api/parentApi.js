import api, { unwrapList, unwrapItem } from './axios';
import { normalizeStudent } from './studentsApi';

// NOTE: these endpoints follow the same "/me" self-scoping pattern as
// schoolApi.js (GET /schools/me), but are NOT confirmed to exist yet on
// the backend. They need controller/route support added:
//   GET /guardians/me/children        -> list of the logged-in parent's linked students
//   GET /guardians/me/children/:id/report-cards
//   GET /guardians/me/children/:id/grades
//   GET /guardians/me/children/:id/attendance-summary

export const getMyChildren = async () => {
  const res = await api.get('/guardians/me/children');
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeStudent) : [];
};

export const getChildReportCards = async (studentId) => {
  const res = await api.get(`/guardians/me/children/${studentId}/report-cards`);
  return unwrapList(res.data);
};

export const getChildGrades = async (studentId, params) => {
  const res = await api.get(`/guardians/me/children/${studentId}/grades`, { params });
  return unwrapList(res.data);
};

export const getChildAttendance = async (studentId, params) => {
  const res = await api.get(`/guardians/me/children/${studentId}/attendance-summary`, { params });
  return unwrapItem(res.data);
};
// frontend/src/api/guardiansApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── LIST ──────────────────────────────────────────────────────
export const getGuardians = async (params) => {
  const res = await api.get('/guardians', { params });
  return unwrapList(res.data);
};

export const getGuardian = async (id) => {
  const res = await api.get(`/guardians/${id}`);
  return unwrapItem(res.data);
};

// ─── CRUD ──────────────────────────────────────────────────────
export const createGuardian = async (data) => {
  const res = await api.post('/guardians', data);
  return unwrapItem(res.data);
};

export const updateGuardian = async (id, data) => {
  const res = await api.patch(`/guardians/${id}`, data);
  return unwrapItem(res.data);
};

// ─── STUDENT LINKING ───────────────────────────────────────────
export const linkStudent = async (id, data) => {
  const res = await api.post(`/guardians/${id}/link`, data);
  return unwrapItem(res.data);
};

// ─── SELF-SERVICE ──────────────────────────────────────────────
export const getMyChildren = async () => {
  const res = await api.get('/guardians/me/children');
  return unwrapList(res.data);
};

export const getChildReportCards = async (studentId) => {
  const res = await api.get(`/guardians/me/children/${studentId}/report-cards`);
  return unwrapList(res.data);
};

export const getChildGrades = async (studentId) => {
  const res = await api.get(`/guardians/me/children/${studentId}/grades`);
  return unwrapList(res.data);
};

export const getChildAttendance = async (studentId) => {
  const res = await api.get(`/guardians/me/children/${studentId}/attendance-summary`);
  return unwrapItem(res.data);
};
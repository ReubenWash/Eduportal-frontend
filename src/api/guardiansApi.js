// frontend/src/api/guardiansApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── NORMALIZE ───────────────────────────────────────────────────
// Backend returns firstName/lastName separately (no combined `name`),
// and `students` as StudentGuardian join rows shaped like
// { student: { firstName, lastName, studentNumber, ... } }.
// This mirrors the normalizeStudent() pattern already used in studentsApi.js
// so pages can just read `.name` / `.students[i].name` directly.
export function normalizeGuardian(g) {
  if (!g || typeof g !== 'object') return g;
  const name = g.name || `${g.firstName || ''} ${g.lastName || ''}`.trim();
  const students = Array.isArray(g.students)
    ? g.students.map(link => {
        const s = link.student || link; // handle both join-row and flat shapes
        return {
          ...link,
          id: s.id,
          name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          studentNo: s.studentNo || s.studentNumber || '',
        };
      })
    : [];
  return {
    ...g,
    name,
    students,
  };
}

// ─── LIST ──────────────────────────────────────────────────────
export const getGuardians = async (params) => {
  const res = await api.get('/guardians', { params });
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeGuardian) : [];
};

export const getGuardian = async (id) => {
  const res = await api.get(`/guardians/${id}`);
  return normalizeGuardian(unwrapItem(res.data));
};

// ─── CRUD ──────────────────────────────────────────────────────
// data: { firstName, lastName, phone, relationship, email? }
export const createGuardian = async (data) => {
  const res = await api.post('/guardians', data);
  return normalizeGuardian(unwrapItem(res.data));
};

export const updateGuardian = async (id, data) => {
  const res = await api.patch(`/guardians/${id}`, data);
  return normalizeGuardian(unwrapItem(res.data));
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

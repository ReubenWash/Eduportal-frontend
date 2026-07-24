import api, { unwrapList, unwrapItem } from './axios';

// ── Normalizer ────────────────────────────────────────────────────
// Backend returns { id, level:"JHS1", section:"A", academicYear, classTeacher:{firstName,lastName} }
// Frontend expects { id, name:"JHS1 A", academicYear, classTeacher:{name:...}, ... }
function normalizeClass(c) {
  if (!c || typeof c !== 'object') return c;
  return {
    ...c,
    name: c.name ?? `${c.level ?? ''} ${c.section ?? ''}`.trim(),
    classTeacher: c.classTeacher
      ? {
          ...c.classTeacher,
          name:
            c.classTeacher.name ??
            `${c.classTeacher.firstName ?? ''} ${c.classTeacher.lastName ?? ''}`.trim(),
        }
      : null,
  };
}

// GET /classes
export const getClasses = async (params) => {
  const res = await api.get('/classes', { params });
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeClass) : [];
};

// GET /classes/:id
export const getClass = async (id) => {
  const res = await api.get(`/classes/${id}`);
  return normalizeClass(unwrapItem(res.data));
};

// POST /classes
export const createClass = async (data) => {
  const res = await api.post('/classes', data);
  return normalizeClass(unwrapItem(res.data));
};

// PATCH /classes/:id
export const updateClass = async (id, data) => {
  const res = await api.patch(`/classes/${id}`, data);
  return normalizeClass(unwrapItem(res.data));
};

// DELETE /classes/:id
export const deleteClass = async (id) => {
  const res = await api.delete(`/classes/${id}`);
  return unwrapItem(res.data);
};

// POST /classes/:id/subjects
export const addClassSubjects = async (id, data) => {
  const res = await api.post(`/classes/${id}/subjects`, data);
  return unwrapItem(res.data);
};

// DELETE /classes/:id/subjects/:subjectId
export const removeClassSubject = async (classId, subjectId) => {
  const res = await api.delete(`/classes/${classId}/subjects/${subjectId}`);
  return unwrapItem(res.data);
};
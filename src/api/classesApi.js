import api, { unwrapList, unwrapItem } from './axios';

// ── Normalizer ────────────────────────────────────────────────────
// Backend returns { id, level:"JHS1", section:"A", academicYear, classTeacher:{firstName,lastName} }
// Frontend expects { id, name:"JHS1 A", academicYear, classTeacher:{name:...}, ... }
function normalizeClass(c) {
  if (!c || typeof c !== 'object') return c;
  return {
    ...c,
    // Computed display name
    name: c.name ?? `${c.level ?? ''} ${c.section ?? ''}`.trim(),
    // Flatten classTeacher name
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

export const getClasses = async (params) => {
  const res = await api.get('/classes', { params });
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeClass) : [];
};

export const createClass = async (data) => {
  const res = await api.post('/classes', data);
  return normalizeClass(unwrapItem(res.data));
};

export const updateClass = async (id, data) => {
  const res = await api.patch(`/classes/${id}`, data);
  return normalizeClass(unwrapItem(res.data));
};

export const manageClassSubjects = async (id, data) => {
  const res = await api.post(`/classes/${id}/subjects`, data);
  return unwrapItem(res.data);
};
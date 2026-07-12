import api, { unwrapList, unwrapItem } from './axios';

// ── Normalizer ────────────────────────────────────────────────────
// Backend returns Prisma Student shape:
//   { id, firstName, lastName, studentNumber, dateOfBirth, photoUrl, status, gender,
//     enrollments: [{ class: { level, section } }] }
// Frontend expects flat fields: name, studentNo, dob, photo, className, classId
function normalizeStudent(s) {
  if (!s || typeof s !== 'object') return s;

  // Full name
  const name =
    s.name ??
    `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();

  // Current class from latest enrollment
  const latestEnrollment = Array.isArray(s.enrollments) ? s.enrollments[0] : null;
  const cls = latestEnrollment?.class ?? null;
  const className =
    s.className ??
    (cls ? `${cls.level ?? ''} ${cls.section ?? ''}`.trim() : '');
  const classId = s.classId ?? latestEnrollment?.classId ?? cls?.id ?? '';

  return {
    ...s,
    name,
    studentNo: s.studentNo ?? s.studentNumber ?? '',
    dob: s.dob ?? (s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : ''),
    photo: s.photo ?? s.photoUrl ?? null,
    gender: s.gender ?? '',
    status: s.status ?? 'ACTIVE',
    className,
    classId,
  };
}

export const getStudents = async (params) => {
  const res = await api.get('/students', { params });
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeStudent) : [];
};

export const getStudent = async (id) => {
  const res = await api.get(`/students/${id}`);
  return normalizeStudent(unwrapItem(res.data));
};

export const createStudent = async (data) => {
  const res = await api.post('/students', data);
  return normalizeStudent(unwrapItem(res.data));
};

export const updateStudent = async (id, data) => {
  const res = await api.patch(`/students/${id}`, data);
  return normalizeStudent(unwrapItem(res.data));
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return unwrapItem(res.data);
};

export const bulkImportStudents = async (formData) => {
  const res = await api.post('/students/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

export const transferStudent = async (id, data) => {
  const res = await api.post(`/students/${id}/transfer`, data);
  return unwrapItem(res.data);
};
// frontend/src/api/studentsApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── NORMALIZER ────────────────────────────────────────────────
export function normalizeStudent(s) {
  if (!s || typeof s !== 'object') return s;
  const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
  const latestEnrollment = Array.isArray(s.enrollments) ? s.enrollments[0] : null;
  const cls = latestEnrollment?.class ?? null;
  const className = s.className || (cls ? `${cls.level || ''} ${cls.section || ''}`.trim() : '');
  const classId = s.classId || latestEnrollment?.classId || cls?.id || '';
  return {
    ...s,
    name,
    studentNo: s.studentNo || s.studentNumber || '',
    dob: s.dob || (s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : ''),
    photo: s.photo || s.photoUrl || null,
    gender: s.gender || '',
    status: s.status || 'ACTIVE',
    className,
    classId,
  };
}

// ─── EXPORT ─────────────────────────────────────────────────────
export const exportStudents = async (params) => {
  const res = await api.get('/students/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// ─── IMPORT ────────────────────────────────────────────────────
export const importStudentsExcel = async (formData) => {
  const res = await api.post('/students/import-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// One student's passport photo (the server crops it to a portrait centred on the face)
export const uploadStudentPhoto = async (studentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/students/${studentId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// Excel template with the school's own classes in a dropdown
export const downloadStudentImportTemplate = async () => {
  const res = await api.get('/students/import-template', { responseType: 'blob' });
  return res.data;
};

// Step 1 of a bulk import: the server reads and checks the file but saves nothing
export const previewStudentImport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/students/import-preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// Step 2: save a batch of checked rows (the modal sends 20 at a time)
export const bulkImportStudents = async (records) => {
  const res = await api.post('/students/bulk-import', { records });
  return unwrapItem(res.data);
};

// ─── LIST ──────────────────────────────────────────────────────
export const getStudents = async (params) => {
  const res = await api.get('/students', { params });
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeStudent) : [];
};

// ─── SINGLE ────────────────────────────────────────────────────
export const getStudentById = async (id) => {
  const res = await api.get(`/students/${id}`);
  return normalizeStudent(unwrapItem(res.data));
};

export const getStudent = async (id) => {
  const res = await api.get(`/students/${id}`);
  return normalizeStudent(unwrapItem(res.data));
};

export const getStudentReports = async (id, params) => {
  const res = await api.get(`/students/${id}/reports`, { params });
  return unwrapList(res.data);
};

export const getStudentTranscript = async (id) => {
  const res = await api.get(`/students/${id}/transcript`);
  return unwrapItem(res.data);
};

// ─── CRUD ──────────────────────────────────────────────────────
export const createStudent = async (data) => {
  const res = await api.post('/students', data);
  return normalizeStudent(unwrapItem(res.data));
};

// ─── FIXED: Corrected syntax ──────────────────────────────────
export const updateStudent = async (id, data) => {
  const res = await api.patch(`/students/${id}`, data);
  return normalizeStudent(unwrapItem(res.data));
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return unwrapItem(res.data);
};

// ─── TRANSFER ──────────────────────────────────────────────────
export const transferStudent = async (id, data) => {
  const res = await api.post(`/students/${id}/transfer`, data);
  return unwrapItem(res.data);
};
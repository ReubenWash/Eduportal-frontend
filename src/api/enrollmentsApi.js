import api, { unwrapList, unwrapItem } from './axios';

// ── Normalizer ─────────────────────────────────────────────────────
// Backend Enrollment shape (from getEnrollments with include):
//   {
//     id, studentId, classId, termId, createdAt,
//     student: { firstName, lastName, studentNumber },
//     class:   { level, section },
//     term:    { academicYear, termNumber },
//   }
// Frontend expects: studentName, className, termName, enrollmentDate, status
function normalizeEnrollment(e) {
  if (!e || typeof e !== 'object') return e;

  const studentName =
    e.studentName ??
    (e.student
      ? `${e.student.firstName ?? ''} ${e.student.lastName ?? ''}`.trim()
      : '');

  const className =
    e.className ??
    (e.class
      ? `${e.class.level ?? ''} ${e.class.section ?? ''}`.trim()
      : '');

  // termNumber enum: "TERM1" → "Term 1"
  const termLabel = e.term?.termNumber
    ? e.term.termNumber.replace('TERM', 'Term ')
    : '';
  const termName =
    e.termName ??
    (e.term
      ? `${e.term.academicYear ?? ''} ${termLabel}`.trim()
      : '');

  // Enrollment model has no status — derive from term
  const status =
    e.status ??
    (e.term?.status === 'ACTIVE'
      ? 'ACTIVE'
      : e.term?.status === 'COMPLETED'
      ? 'COMPLETED'
      : 'ENROLLED');

  return {
    ...e,
    studentName,
    className,
    termName,
    enrollmentDate: e.enrollmentDate ?? e.createdAt ?? null,
    status,
  };
}

export const getEnrollments = async (params) => {
  const res = await api.get('/enrollments', { params });
  const list = unwrapList(res.data);
  return Array.isArray(list) ? list.map(normalizeEnrollment) : [];
};

export const createEnrollment = async (data) => {
  const res = await api.post('/enrollments', data);
  return normalizeEnrollment(unwrapItem(res.data));
};

export const bulkEnroll = async (data) => {
  const res = await api.post('/enrollments/bulk', data);
  return unwrapItem(res.data);
};

export const deleteEnrollment = async (id) => {
  const res = await api.delete(`/enrollments/${id}`);
  return unwrapItem(res.data);
};
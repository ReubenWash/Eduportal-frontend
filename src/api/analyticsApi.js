import api, { unwrapList, unwrapItem } from './axios';

// ─── PERFORMANCE ──────────────────────────────────────────────────
// GET /analytics/performance
export const getPerformanceAnalytics = async (params) => {
  const res = await api.get('/analytics/performance', { params });
  return unwrapItem(res.data);
};

// ─── SUBJECTS ────────────────────────────────────────────────────
// GET /analytics/subjects
export const getSubjectAnalytics = async (params) => {
  const res = await api.get('/analytics/subjects', { params });
  return unwrapList(res.data);
};

// ─── TOP STUDENTS ────────────────────────────────────────────────
// GET /analytics/top-students
export const getTopStudents = async (params) => {
  const res = await api.get('/analytics/top-students', { params });
  return unwrapList(res.data);
};

// ─── TRENDS ──────────────────────────────────────────────────────
// GET /analytics/trends
export const getAnalyticsTrends = async (params) => {
  const res = await api.get('/analytics/trends', { params });
  return unwrapItem(res.data);
};

// ─── GENDER ──────────────────────────────────────────────────────
// GET /analytics/gender
export const getGenderAnalytics = async (params) => {
  const res = await api.get('/analytics/gender', { params });
  return unwrapItem(res.data);
};

// ─── EXPORT ──────────────────────────────────────────────────────
// GET /analytics/export (returns blob)
export const exportAnalytics = async (params) => {
  const res = await api.get('/analytics/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// ─── ATTENDANCE ANALYTICS ────────────────────────────────────────
// GET /attendance/analytics
export const getAttendanceAnalytics = async (params) => {
  const res = await api.get('/attendance/analytics', { params });
  return unwrapList(res.data);
};

// ─── SCHOOL PERFORMANCE SUMMARY ─────────────────────────────────
// GET /analytics/school-summary (if this endpoint exists)
export const getSchoolSummary = async (params) => {
  const res = await api.get('/analytics/school-summary', { params });
  return unwrapItem(res.data);
};

// ─── CLASS PERFORMANCE ───────────────────────────────────────────
// GET /analytics/class/:classId
export const getClassAnalytics = async (classId, params) => {
  const res = await api.get(`/analytics/class/${classId}`, { params });
  return unwrapItem(res.data);
};

// ─── STUDENT PERFORMANCE ────────────────────────────────────────
// GET /analytics/student/:studentId
export const getStudentAnalytics = async (studentId, params) => {
  const res = await api.get(`/analytics/student/${studentId}`, { params });
  return unwrapItem(res.data);
};

// ─── SUBJECT PERFORMANCE BY CLASS ──────────────────────────────
// GET /analytics/subject/:subjectId/class/:classId
export const getSubjectClassAnalytics = async (subjectId, classId, params) => {
  const res = await api.get(`/analytics/subject/${subjectId}/class/${classId}`, { params });
  return unwrapItem(res.data);
};

// ─── EXPORT FUNCTIONS ────────────────────────────────────────────
export const exportPerformanceReport = async (params) => {
  const res = await api.get('/analytics/export/performance', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

export const exportSubjectReport = async (params) => {
  const res = await api.get('/analytics/export/subjects', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

export const exportStudentReport = async (params) => {
  const res = await api.get('/analytics/export/students', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────
// GET /analytics/dashboard
export const getAnalyticsDashboard = async (params) => {
  const res = await api.get('/analytics/dashboard', { params });
  return unwrapItem(res.data);
};

export default {
  getPerformanceAnalytics,
  getSubjectAnalytics,
  getTopStudents,
  getAnalyticsTrends,
  getGenderAnalytics,
  exportAnalytics,
  getAttendanceAnalytics,
  getSchoolSummary,
  getClassAnalytics,
  getStudentAnalytics,
  getSubjectClassAnalytics,
  exportPerformanceReport,
  exportSubjectReport,
  exportStudentReport,
  getAnalyticsDashboard,
};
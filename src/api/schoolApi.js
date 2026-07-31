// src/api/schoolApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── SCHOOL PROFILE ─────────────────────────────────────────────
export const getSchool = async () => {
  const res = await api.get('/schools/me');
  return unwrapItem(res.data);
};

export const updateSchool = async (data) => {
  const res = await api.patch('/schools/me', data);
  return unwrapItem(res.data);
};

export const getDashboardStats = async () => {
  const res = await api.get('/schools/me/dashboard');
  return unwrapItem(res.data);
};

// ─── TERMS ──────────────────────────────────────────────────────
export const getSchoolTerms = async (academicYear) => {
  const params = academicYear ? { academicYear } : {};
  const res = await api.get('/schools/me/terms', { params });
  return unwrapList(res.data);
};

export const getTerms = async (academicYear) => {
  const params = academicYear ? { academicYear } : {};
  const res = await api.get('/schools/me/terms', { params });
  return unwrapList(res.data);
};

export const createTerm = async (data) => {
  const res = await api.post('/schools/me/terms', data);
  return unwrapItem(res.data);
};

export const updateTerm = async (id, data) => {
  const res = await api.patch(`/schools/me/terms/${id}`, data);
  return unwrapItem(res.data);
};

// ─── SUPER ADMIN ────────────────────────────────────────────────
export const getAllSchools = async (params) => {
  const res = await api.get('/schools', { params });
  return unwrapList(res.data);
};

export const getDeletedSchools = async (params) => {
  const res = await api.get('/schools', { 
    params: { ...params, status: 'DEACTIVATED' } 
  });
  return unwrapList(res.data);
};

export const getSuperAdminDashboard = async () => {
  const res = await api.get('/schools/admin/dashboard');
  return unwrapItem(res.data);
};

export const manualCreateSchool = async (data) => {
  const res = await api.post('/schools/manual', data);
  return unwrapItem(res.data);
};

export const updateSchoolStatus = async (id, status) => {
  const res = await api.patch(`/schools/${id}/status`, { status });
  return unwrapItem(res.data);
};

export const updateSchoolDetails = async (id, data) => {
  const res = await api.patch(`/schools/${id}`, data);
  return unwrapItem(res.data);
};

export const updateSchoolPlan = async (id, plan) => {
  const res = await api.patch(`/schools/${id}/plan`, { plan });
  return unwrapItem(res.data);
};

export const deleteSchool = async (id) => {
  const res = await api.delete(`/schools/${id}`);
  return unwrapItem(res.data);
};

export const restoreSchool = async (id) => {
  const res = await api.patch(`/schools/${id}/restore`);
  return unwrapItem(res.data);
};

// ─── DOWNLOAD REGISTRATION PDF ──────────────────────────────────
export const downloadRegistrationPdf = async (schoolId) => {
  const res = await api.get(`/schools/${schoolId}/registration-pdf`, {
    responseType: 'blob',
  });
  return res.data;
};

// ─── STUDENTS ──────────────────────────────────────────────────
export const getStudents = async (params) => {
  const res = await api.get('/students', { params });
  return unwrapList(res.data);
};

export const createStudent = async (data) => {
  const res = await api.post('/students', data);
  return unwrapItem(res.data);
};

export const getStudentById = async (id) => {
  const res = await api.get(`/students/${id}`);
  return unwrapItem(res.data);
};

export const updateStudent = async (id, data) => {
  const res = await api.patch(`/students/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return unwrapItem(res.data);
};

// ─── STAFF ─────────────────────────────────────────────────────
export const getStaff = async (params) => {
  const res = await api.get('/staff', { params });
  return unwrapList(res.data);
};

export const createStaff = async (data) => {
  const res = await api.post('/staff', data);
  return unwrapItem(res.data);
};

export const updateStaff = async (id, data) => {
  const res = await api.patch(`/staff/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteStaff = async (id) => {
  const res = await api.delete(`/staff/${id}`);
  return unwrapItem(res.data);
};

// ─── CLASSES ──────────────────────────────────────────────────
export const getClasses = async (params) => {
  const res = await api.get('/classes', { params });
  return unwrapList(res.data);
};

export const createClass = async (data) => {
  const res = await api.post('/classes', data);
  return unwrapItem(res.data);
};

export const updateClass = async (id, data) => {
  const res = await api.patch(`/classes/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteClass = async (id) => {
  const res = await api.delete(`/classes/${id}`);
  return unwrapItem(res.data);
};

// ─── SUBJECTS ──────────────────────────────────────────────────
export const getSubjects = async (params) => {
  const res = await api.get('/subjects', { params });
  return unwrapList(res.data);
};

export const createSubject = async (data) => {
  const res = await api.post('/subjects', data);
  return unwrapItem(res.data);
};

export const updateSubject = async (id, data) => {
  const res = await api.patch(`/subjects/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteSubject = async (id) => {
  const res = await api.delete(`/subjects/${id}`);
  return unwrapItem(res.data);
};

// ─── ENROLLMENTS ──────────────────────────────────────────────
export const getEnrollments = async (params) => {
  const res = await api.get('/enrollments', { params });
  return unwrapList(res.data);
};

export const createEnrollment = async (data) => {
  const res = await api.post('/enrollments', data);
  return unwrapItem(res.data);
};

export const deleteEnrollment = async (id) => {
  const res = await api.delete(`/enrollments/${id}`);
  return unwrapItem(res.data);
};

// ─── SCORES ──────────────────────────────────────────────────
export const getScores = async (params) => {
  const res = await api.get('/scores', { params });
  return unwrapList(res.data);
};

export const createScore = async (data) => {
  const res = await api.post('/scores', data);
  return unwrapItem(res.data);
};

export const updateScore = async (id, data) => {
  const res = await api.patch(`/scores/${id}`, data);
  return unwrapItem(res.data);
};

// ─── ATTENDANCE ──────────────────────────────────────────────
export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return unwrapList(res.data);
};

export const createAttendance = async (data) => {
  const res = await api.post('/attendance', data);
  return unwrapItem(res.data);
};

export const updateAttendance = async (id, data) => {
  const res = await api.patch(`/attendance/${id}`, data);
  return unwrapItem(res.data);
};

// ─── REPORTS ──────────────────────────────────────────────────
export const getReports = async (params) => {
  const res = await api.get('/reports', { params });
  return unwrapList(res.data);
};

export const generateReport = async (data) => {
  const res = await api.post('/reports/generate', data);
  return unwrapItem(res.data);
};

export const releaseReport = async (id) => {
  const res = await api.patch(`/reports/${id}/release`);
  return unwrapItem(res.data);
};

// ─── EXPORT ──────────────────────────────────────────────────
export default {
  getSchool,
  updateSchool,
  getDashboardStats,
  getSchoolTerms,
  getTerms,
  createTerm,
  updateTerm,
  getAllSchools,
  getDeletedSchools,
  getSuperAdminDashboard,
  manualCreateSchool,
  updateSchoolStatus,
  updateSchoolDetails,
  updateSchoolPlan,
  deleteSchool,
  restoreSchool,
  downloadRegistrationPdf,
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getEnrollments,
  createEnrollment,
  deleteEnrollment,
  getScores,
  createScore,
  updateScore,
  getAttendance,
  createAttendance,
  updateAttendance,
  getReports,
  generateReport,
  releaseReport,
};
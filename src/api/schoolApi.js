// frontend/src/api/schoolApi.js
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
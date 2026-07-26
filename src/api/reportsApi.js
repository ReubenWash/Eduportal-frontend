// frontend/src/api/reportsApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── LIST ──────────────────────────────────────────────────────
export const getReports = async (params) => {
  const res = await api.get('/reports', { params });
  return unwrapList(res.data);
};

export const getClassReports = async (classId, termId) => {
  const res = await api.get(`/reports/class/${classId}/term/${termId}`);
  return unwrapList(res.data);
};

// ─── SINGLE REPORT ────────────────────────────────────────────
export const getReport = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return unwrapItem(res.data);
};

export const getReportPreview = async (id) => {
  const res = await api.get(`/reports/${id}/preview`);
  return unwrapItem(res.data);
};

// ─── GENERATE ──────────────────────────────────────────────────
export const generateReports = async (data) => {
  const res = await api.post('/reports/generate', data);
  return unwrapItem(res.data);
};

// ─── UPDATE ────────────────────────────────────────────────────
export const updateReportRemarks = async (id, data) => {
  const res = await api.patch(`/reports/${id}/remarks`, data);
  return unwrapItem(res.data);
};

// ─── APPROVE ────────────────────────────────────────────────────
export const approveReport = async (id) => {
  const res = await api.post(`/reports/${id}/approve`);
  return unwrapItem(res.data);
};

// ─── RELEASE ────────────────────────────────────────────────────
export const releaseReport = async (id) => {
  const res = await api.post(`/reports/${id}/release`);
  return unwrapItem(res.data);
};

// ─── BULK RELEASE ──────────────────────────────────────────────
export const releaseBulkReports = async (data) => {
  const res = await api.post('/reports/release-bulk', data);
  return unwrapItem(res.data);
};

// ─── REGENERATE ─────────────────────────────────────────────────
export const regenerateReport = async (id) => {
  const res = await api.post(`/reports/${id}/regenerate-pdf`);
  return unwrapItem(res.data);
};

// ─── EMAIL ──────────────────────────────────────────────────────
export const sendReportEmail = async (id, data) => {
  const res = await api.post(`/reports/email`, { reportId: id, ...data });
  return unwrapItem(res.data);
};

export const sendBulkReportEmails = async (data) => {
  const res = await api.post('/reports/email', data);
  return unwrapItem(res.data);
};

// ─── DOWNLOAD ──────────────────────────────────────────────────
export const downloadClassZip = async (classId, termId) => {
  const res = await api.get(`/reports/class/${classId}/term/${termId}`, {
    responseType: 'blob'
  });
  return res.data;
};

// ─── UTILITY ───────────────────────────────────────────────────
export const getReportDownloadUrl = (id) => {
  return `${api.defaults.baseURL}/reports/${id}/download`;
};
import api, { unwrapList, unwrapItem } from './axios';

// GET /reports/class/:classId/term/:termId
export const getClassReports = async (classId, termId) => {
  const res = await api.get(`/reports/class/${classId}/term/${termId}`);
  return unwrapList(res.data);
};

// GET /reports/:id
export const getReport = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return unwrapItem(res.data);
};

// GET /reports/:id/preview
export const getReportPreview = async (id) => {
  const res = await api.get(`/reports/${id}/preview`);
  return unwrapItem(res.data);
};

// POST /reports/generate
export const generateReports = async (data) => {
  const res = await api.post('/reports/generate', data);
  return unwrapItem(res.data);
};

// POST /reports/release-bulk
export const releaseBulkReports = async (data) => {
  const res = await api.post('/reports/release-bulk', data);
  return unwrapItem(res.data);
};

// POST /reports/email
export const sendReportsEmail = async (data) => {
  const res = await api.post('/reports/email', data);
  return unwrapItem(res.data);
};

// PATCH /reports/:id/remarks
export const updateReportRemarks = async (id, data) => {
  const res = await api.patch(`/reports/${id}/remarks`, data);
  return unwrapItem(res.data);
};

// POST /reports/:id/approve
export const approveReport = async (id) => {
  const res = await api.post(`/reports/${id}/approve`);
  return unwrapItem(res.data);
};

// POST /reports/:id/release
export const releaseReport = async (id) => {
  const res = await api.post(`/reports/${id}/release`);
  return unwrapItem(res.data);
};

// POST /reports/:id/regenerate-pdf
export const regenerateReport = async (id) => {
  const res = await api.post(`/reports/${id}/regenerate-pdf`);
  return unwrapItem(res.data);
};

// ── Backward-compat aliases (used by existing page imports) ──────
// GET /reports  (list all reports)
export const getReports = async (params) => {
  const res = await api.get('/reports', { params });
  return unwrapList(res.data);
};

// POST /reports/email  (alias: old pages call sendReportEmail(id, data))
export const sendReportEmail = async (_id, data) => {
  const res = await api.post('/reports/email', data);
  return unwrapItem(res.data);
};

// GET /reports/:id/download  — returns a direct URL string (no auth needed via link)
export const getReportDownloadUrl = (id) =>
  `${api.defaults.baseURL}/reports/${id}/download`;
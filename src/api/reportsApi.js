// frontend/src/api/reportsApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── CLASSES THE USER CAN WRITE REMARKS FOR ────────────────────
// School admin: every class. Class teacher: only their own class.
export const getReportClasses = async () => {
  const res = await api.get('/reports/my-classes');
  return unwrapList(res.data);
};

// ─── STATS ──────────────────────────────────────────────────────
export const getReportStats = async (termId) => {
  const res = await api.get('/reports/stats', { params: { termId } });
  return unwrapItem(res.data);
};

// ─── LIST ──────────────────────────────────────────────────────
export const getReports = async (params) => {
  const res = await api.get('/reports', { params });
  return unwrapList(res.data);
};

export const getClassReports = async (classId, termId) => {
  const res = await api.get(`/reports/class/${classId}/term/${termId}`);
  return unwrapList(res.data);
};

export const getStudentReports = async (studentId) => {
  const res = await api.get(`/reports/student/${studentId}`);
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

export const generateBatchReports = async (data) => {
  const res = await api.post('/reports/generate-batch', data);
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
  const payload = {
    ...(data || {}),
    ...(data?.classId && data?.termId ? {} : {}),
  };

  if (!payload.classId && !payload.termId && Array.isArray(data?.ids) && data.ids.length > 0) {
    const report = await api.get(`/reports/${data.ids[0]}`);
    const item = unwrapItem(report.data);
    if (item?.classId && item?.termId) {
      payload.classId = item.classId;
      payload.termId = item.termId;
    }
  }

  const res = await api.post('/reports/release-bulk', payload);
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

// ─── EXPORT REPORTS ────────────────────────────────────────────
export const exportReports = async (params) => {
  const res = await api.get('/reports/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// ─── UTILITY ───────────────────────────────────────────────────
export const openReportPreview = async (id) => {
  try {
    const res = await api.get(`/reports/${id}/preview`, { responseType: 'blob' });
    const contentType = res.headers['content-type'] || 'application/pdf';
    const blob = new Blob([res.data], {
      type: contentType,
    });
    const objectUrl = URL.createObjectURL(blob);
    const newWindow = window.open('', '_blank', 'noopener,noreferrer');

    if (newWindow) {
      newWindow.document.write(`<!doctype html><html><head><title>Report Preview</title></head><body style="margin:0"><iframe src="${objectUrl}" style="width:100vw;height:100vh;border:0" /></body></html>`);
      newWindow.document.close();
    }

    return objectUrl;
  } catch (error) {
    console.error('Failed to open report preview:', error);
    throw error;
  }
};

export const downloadReportPDF = async (id, fileName = `report-${id}.pdf`) => {
  try {
    const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], {
      type: res.headers['content-type'] || 'application/pdf',
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return objectUrl;
  } catch (error) {
    console.error('Failed to download report PDF:', error);
    throw error;
  }
};

export const getReportDownloadUrl = (id) => {
  return `${api.defaults.baseURL}/reports/${id}/pdf`;
};

export const getReportPreviewUrl = (id) => {
  return `${api.defaults.baseURL}/reports/${id}/preview`;
};

export const getClassZipDownloadUrl = (classId, termId) => {
  return `${api.defaults.baseURL}/reports/class/${classId}/term/${termId}`;
};

// ─── DEFAULT EXPORT ────────────────────────────────────────────
export default {
  getReportClasses,
  getReportStats,
  getReports,
  getClassReports,
  getStudentReports,
  getReport,
  getReportPreview,
  generateReports,
  generateBatchReports,
  updateReportRemarks,
  approveReport,
  releaseReport,
  releaseBulkReports,
  regenerateReport,
  sendReportEmail,
  sendBulkReportEmails,
  downloadClassZip,
  exportReports,
  openReportPreview,
  downloadReportPDF,
  getReportDownloadUrl,
  getClassZipDownloadUrl,
};
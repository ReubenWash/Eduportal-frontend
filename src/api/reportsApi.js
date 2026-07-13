import api, { unwrapList, unwrapItem } from './axios';

export const getReports = async (params) => {
  const res = await api.get('/reports', { params });
  return unwrapList(res.data);
};

export const getReportPreview = async (id) => {
  const res = await api.get(`/reports/${id}/preview`);
  return unwrapItem(res.data);
};

export const getReportDownloadUrl = (id) => {
  return `${api.defaults.baseURL}/reports/${id}/download`;
};

export const generateReports = async (data) => {
  const res = await api.post('/reports/generate', data);
  return unwrapItem(res.data);
};

export const approveReport = async (id) => {
  const res = await api.post(`/reports/${id}/approve`);
  return unwrapItem(res.data);
};

export const releaseReport = async (id) => {
  const res = await api.post(`/reports/${id}/release`);
  return unwrapItem(res.data);
};

export const releaseBulkReports = async (data) => {
  const res = await api.post('/reports/release-bulk', data);
  return unwrapItem(res.data);
};

export const sendReportEmail = async (id, data) => {
  const res = await api.post(`/reports/${id}/email`, data);
  return unwrapItem(res.data);
};

export const regenerateReport = async (id) => {
  const res = await api.post(`/reports/${id}/regenerate`);
  return unwrapItem(res.data);
};
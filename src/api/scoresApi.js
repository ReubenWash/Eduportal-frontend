// frontend/src/api/scoresApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── LIST ──────────────────────────────────────────────────────
export const getScores = async (params) => {
  const res = await api.get('/scores', { params });
  return unwrapList(res.data);
};

export const getClassSummary = async (params) => {
  const res = await api.get('/scores/class-summary', { params });
  return unwrapItem(res.data);
};

// ✅ GET /scores/submission-status
export const getSubmissionStatus = async (params) => {
  const res = await api.get('/scores/submission-status', { params });
  return unwrapItem(res.data);
};

// ─── TEMPLATE ──────────────────────────────────────────────────
export const downloadScoreTemplate = async (params) => {
  const res = await api.get('/scores/template', { 
    params,
    responseType: 'blob' 
  });
  return res.data;
};

export const getScoreTemplateUrl = () => {
  return `${api.defaults.baseURL}/scores/template`;
};

// ─── IMPORT ────────────────────────────────────────────────────
export const importScoresExcel = async (formData, params) => {
  const res = await api.post('/scores/import-excel', formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// ─── CRUD ──────────────────────────────────────────────────────
export const createScore = async (data) => {
  // Clean data before sending
  const cleanData = {};
  if (data.studentId) cleanData.studentId = data.studentId;
  if (data.subjectId) cleanData.subjectId = data.subjectId;
  if (data.termId) cleanData.termId = data.termId;
  if (data.ca1 !== undefined && data.ca1 !== null && data.ca1 !== '') cleanData.ca1 = Number(data.ca1);
  if (data.ca2 !== undefined && data.ca2 !== null && data.ca2 !== '') cleanData.ca2 = Number(data.ca2);
  if (data.ca3 !== undefined && data.ca3 !== null && data.ca3 !== '') cleanData.ca3 = Number(data.ca3);
  if (data.examScore !== undefined && data.examScore !== null && data.examScore !== '') cleanData.examScore = Number(data.examScore);
  
  const res = await api.post('/scores', cleanData);
  return unwrapItem(res.data);
};

export const updateScore = async (id, data) => {
  // Clean data before sending
  const cleanData = {};
  if (data.ca1 !== undefined && data.ca1 !== null && data.ca1 !== '') cleanData.ca1 = Number(data.ca1);
  if (data.ca2 !== undefined && data.ca2 !== null && data.ca2 !== '') cleanData.ca2 = Number(data.ca2);
  if (data.ca3 !== undefined && data.ca3 !== null && data.ca3 !== '') cleanData.ca3 = Number(data.ca3);
  if (data.examScore !== undefined && data.examScore !== null && data.examScore !== '') cleanData.examScore = Number(data.examScore);
  
  const res = await api.patch(`/scores/${id}`, cleanData);
  return unwrapItem(res.data);
};

// ─── COMPUTE ────────────────────────────────────────────────────
export const computeGrades = async (data) => {
  const res = await api.post('/scores/compute', data);
  return unwrapItem(res.data);
};

// ─── EXPORT ────────────────────────────────────────────────────
export const exportScores = async (params) => {
  const res = await api.get('/scores/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// ─── BULK IMPORT ──────────────────────────────────────────────
export const bulkImportScores = async (data) => {
  const res = await api.post('/scores/bulk-import', data);
  return unwrapItem(res.data);
};

// ─── EXPORT DEFAULT ────────────────────────────────────────────
export default {
  getScores,
  getClassSummary,
  getSubmissionStatus,
  downloadScoreTemplate,
  getScoreTemplateUrl,
  importScoresExcel,
  createScore,
  updateScore,
  computeGrades,
  exportScores,
  bulkImportScores,
};
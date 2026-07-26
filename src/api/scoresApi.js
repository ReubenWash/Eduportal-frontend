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
  const res = await api.post('/scores', data);
  return unwrapItem(res.data);
};

export const updateScore = async (id, data) => {
  const res = await api.patch(`/scores/${id}`, data);
  return unwrapItem(res.data);
};

// ─── COMPUTE ────────────────────────────────────────────────────
export const computeGrades = async (data) => {
  const res = await api.post('/scores/compute', data);
  return unwrapItem(res.data);
};
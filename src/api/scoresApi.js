// frontend/src/api/scoresApi.js
import api, { unwrapList, unwrapItem } from './axios';
import { cacheData, cachedRequest, readCachedData } from '../utils/offlineStore';
import { isNetworkFailure, queueOfflineMutation } from '../utils/offlineSync';

// ─── LIST ──────────────────────────────────────────────────────
export const getScores = async (params) => {
  return cachedRequest('scores', params, async () => {
    const res = await api.get('/scores', { params });
    return unwrapList(res.data);
  });
};

export const getClassSummary = async (params) => {
  return cachedRequest('score-summary', params, async () => {
    const res = await api.get('/scores/class-summary', { params });
    return unwrapItem(res.data);
  });
};

// ✅ GET /scores/submission-status
export const getSubmissionStatus = async (params) => {
  return cachedRequest('score-submission-status', params, async () => {
    const res = await api.get('/scores/submission-status', { params });
    return unwrapItem(res.data);
  });
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
  
  try {
    const res = await api.post('/scores', cleanData);
    return unwrapItem(res.data);
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    const identity = `${data.studentId}:${data.subjectId}:${data.termId}`;
    const queued = queueOfflineMutation({
      dedupeKey: `score:${identity}`,
      entityKey: identity,
      method: 'post',
      url: '/scores',
      data: { ...cleanData, studentId: data.studentId, subjectId: data.subjectId, termId: data.termId },
    });
    const score = { ...cleanData, id: `offline-${queued.queueId}`, studentId: data.studentId, subjectId: data.subjectId, termId: data.termId };
    const params = { subjectId: data.subjectId, termId: data.termId, classId: data.classId };
    const scores = readCachedData('scores', params) || [];
    cacheData('scores', params, [...scores.filter(item => item.studentId !== data.studentId), score]);
    return { ...queued, id: score.id };
  }
};

export const updateScore = async (id, data) => {
  // Clean data before sending
  const cleanData = {};
  if (data.ca1 !== undefined && data.ca1 !== null && data.ca1 !== '') cleanData.ca1 = Number(data.ca1);
  if (data.ca2 !== undefined && data.ca2 !== null && data.ca2 !== '') cleanData.ca2 = Number(data.ca2);
  if (data.ca3 !== undefined && data.ca3 !== null && data.ca3 !== '') cleanData.ca3 = Number(data.ca3);
  if (data.examScore !== undefined && data.examScore !== null && data.examScore !== '') cleanData.examScore = Number(data.examScore);
  
  if (String(id).startsWith('offline-')) {
    const identity = `${data.studentId}:${data.subjectId}:${data.termId}`;
    const queued = queueOfflineMutation({
      dedupeKey: `score:${identity}`,
      entityKey: identity,
      method: 'post',
      url: '/scores',
      data: { studentId: data.studentId, subjectId: data.subjectId, termId: data.termId, ...cleanData },
    });
    const params = { subjectId: data.subjectId, termId: data.termId, classId: data.classId };
    const scores = readCachedData('scores', params) || [];
    cacheData('scores', params, scores.map(item => item.studentId === data.studentId ? { ...item, ...cleanData } : item));
    return queued;
  }
  try {
    const res = await api.patch(`/scores/${id}`, cleanData);
    return unwrapItem(res.data);
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    const queued = queueOfflineMutation({
      dedupeKey: `score-record:${id}`,
      method: 'patch',
      url: `/scores/${id}`,
      data: cleanData,
    });
    const params = { subjectId: data.subjectId, termId: data.termId, classId: data.classId };
    const scores = readCachedData('scores', params) || [];
    cacheData('scores', params, scores.map(item => item.id === id ? { ...item, ...cleanData } : item));
    return queued;
  }
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
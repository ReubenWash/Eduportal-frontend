import api, { unwrapList, unwrapItem } from './axios';

// GET /scores
export const getScores = async (params) => {
  const res = await api.get('/scores', { params });
  return unwrapList(res.data);
};

// GET /scores/class-summary
export const getClassSummary = async (params) => {
  const res = await api.get('/scores/class-summary', { params });
  return unwrapItem(res.data);
};

// GET /scores/submission-status
export const getSubmissionStatus = async (params) => {
  const res = await api.get('/scores/submission-status', { params });
  return unwrapItem(res.data);
};

// GET /scores/template  (download excel template)
export const getScoresTemplateUrl = () =>
  `${api.defaults.baseURL}/scores/template`;

// POST /scores/import-excel
export const importScoresExcel = async (formData) => {
  const res = await api.post('/scores/import-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// POST /scores  (create a new score entry)
export const createScore = async (data) => {
  const res = await api.post('/scores', data);
  return unwrapItem(res.data);
};

// PATCH /scores/:id  (update an existing score)
export const updateScore = async (id, data) => {
  const res = await api.patch(`/scores/${id}`, data);
  return unwrapItem(res.data);
};

// POST /scores/compute
export const computeGrades = async (data) => {
  const res = await api.post('/scores/compute', data);
  return unwrapItem(res.data);
};
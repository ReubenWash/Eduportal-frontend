import api, { unwrapList, unwrapItem } from './axios';

export const getScores = async (params) => {
  const res = await api.get('/scores', { params });
  return unwrapList(res.data);
};
export const saveScore = async (id, data) => {
  const res = await api.post(`/scores/${id}`, data);
  return unwrapItem(res.data);
};
export const bulkSaveScores = async (data) => {
  const res = await api.post('/scores/bulk', data);
  return unwrapItem(res.data);
};
export const computeGrades = async (params) => {
  const res = await api.post('/scores/compute', params);
  return unwrapItem(res.data);
};
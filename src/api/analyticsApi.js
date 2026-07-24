import api, { unwrapList, unwrapItem } from './axios';

// GET /analytics/performance
export const getPerformanceAnalytics = async (params) => {
  const res = await api.get('/analytics/performance', { params });
  return unwrapItem(res.data);
};

// GET /analytics/subjects
export const getSubjectAnalytics = async (params) => {
  const res = await api.get('/analytics/subjects', { params });
  return unwrapList(res.data);
};

// GET /analytics/top-students
export const getTopStudents = async (params) => {
  const res = await api.get('/analytics/top-students', { params });
  return unwrapList(res.data);
};

// GET /analytics/trends
export const getAnalyticsTrends = async (params) => {
  const res = await api.get('/analytics/trends', { params });
  return unwrapItem(res.data);
};

// GET /analytics/gender
export const getGenderAnalytics = async (params) => {
  const res = await api.get('/analytics/gender', { params });
  return unwrapItem(res.data);
};

// GET /analytics/export  (returns blob)
export const exportAnalytics = async (params) => {
  const res = await api.get('/analytics/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

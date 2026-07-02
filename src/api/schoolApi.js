import api from './axios';

export const getSchool = async () => {
  const res = await api.get('/schools/me');
  return res.data;
};

export const updateSchool = async (data) => {
  const res = await api.patch('/schools/me', data);
  return res.data;
};

export const getSchoolTerms = async () => {
  const res = await api.get('/schools/me/terms');
  return res.data;
};

export const createTerm = async (data) => {
  const res = await api.post('/schools/me/terms', data);
  return res.data;
};

export const updateTerm = async (id, data) => {
  const res = await api.patch(`/schools/me/terms/${id}`, data);
  return res.data;
};

// Super Admin endpoints
export const getAllSchools = async (params) => {
  const res = await api.get('/schools', { params });
  return res.data;
};

export const updateSchoolStatus = async (id, status) => {
  const res = await api.patch(`/schools/${id}/status`, { status });
  return res.data;
};
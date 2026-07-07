import api, { unwrapList, unwrapItem } from './axios';

export const getEnrollments = async (params) => {
  const res = await api.get('/enrollments', { params });
  return unwrapList(res.data);
};
export const createEnrollment = async (data) => {
  const res = await api.post('/enrollments', data);
  return unwrapItem(res.data);
};
export const bulkEnroll = async (data) => {
  const res = await api.post('/enrollments/bulk', data);
  return unwrapItem(res.data);
};
export const deleteEnrollment = async (id) => {
  const res = await api.delete(`/enrollments/${id}`);
  return unwrapItem(res.data);
};
import api, { unwrapList, unwrapItem } from './axios';

export const getClasses = async (params) => {
  const res = await api.get('/classes', { params });
  return unwrapList(res.data);
};
export const createClass = async (data) => {
  const res = await api.post('/classes', data);
  return unwrapItem(res.data);
};
export const updateClass = async (id, data) => {
  const res = await api.patch(`/classes/${id}`, data);
  return unwrapItem(res.data);
};
export const manageClassSubjects = async (id, data) => {
  const res = await api.post(`/classes/${id}/subjects`, data);
  return unwrapItem(res.data);
};
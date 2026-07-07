import api, { unwrapList, unwrapItem } from './axios';

export const getStaff = async (params) => {
  const res = await api.get('/staff', { params });
  return unwrapList(res.data);
};
export const createStaff = async (data) => {
  const res = await api.post('/staff', data);
  return unwrapItem(res.data);
};
export const updateStaff = async (id, data) => {
  const res = await api.patch(`/staff/${id}`, data);
  return unwrapItem(res.data);
};
export const deleteStaff = async (id) => {
  const res = await api.delete(`/staff/${id}`);
  return unwrapItem(res.data);
};
export const assignSubjects = async (id, data) => {
  const res = await api.post(`/staff/${id}/assign`, data);
  return unwrapItem(res.data);
};
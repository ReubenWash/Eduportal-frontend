import api, { unwrapList, unwrapItem } from './axios';

export const getGuardians = async (params) => {
  const res = await api.get('/guardians', { params });
  return unwrapList(res.data);
};
export const createGuardian = async (data) => {
  const res = await api.post('/guardians', data);
  return unwrapItem(res.data);
};
export const updateGuardian = async (id, data) => {
  const res = await api.patch(`/guardians/${id}`, data);
  return unwrapItem(res.data);
};
export const linkStudent = async (id, data) => {
  const res = await api.post(`/guardians/${id}/link`, data);
  return unwrapItem(res.data);
};
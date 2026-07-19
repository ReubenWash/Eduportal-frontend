import api, { unwrapList, unwrapItem } from './axios';

// GET /guardians
export const getGuardians = async (params) => {
  const res = await api.get('/guardians', { params });
  return unwrapList(res.data);
};

// GET /guardians/:id
export const getGuardian = async (id) => {
  const res = await api.get(`/guardians/${id}`);
  return unwrapItem(res.data);
};

// POST /guardians
export const createGuardian = async (data) => {
  const res = await api.post('/guardians', data);
  return unwrapItem(res.data);
};

// PATCH /guardians/:id
export const updateGuardian = async (id, data) => {
  const res = await api.patch(`/guardians/${id}`, data);
  return unwrapItem(res.data);
};

// POST /guardians/:id/link
export const linkStudent = async (id, data) => {
  const res = await api.post(`/guardians/${id}/link`, data);
  return unwrapItem(res.data);
};
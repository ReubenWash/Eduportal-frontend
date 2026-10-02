import api, { unwrapList, unwrapItem } from './axios';
import { cachedRequest } from '../utils/offlineStore';

export const getSubjects = async (params) => {
  return cachedRequest('subjects', params, async () => {
    const res = await api.get('/subjects', { params });
    return unwrapList(res.data);
  });
};
export const createSubject = async (data) => {
  const res = await api.post('/subjects', data);
  return unwrapItem(res.data);
};
export const updateSubject = async (id, data) => {
  const res = await api.patch(`/subjects/${id}`, data);
  return unwrapItem(res.data);
};
export const deleteSubject = async (id) => {
  const res = await api.delete(`/subjects/${id}`);
  return unwrapItem(res.data);
};
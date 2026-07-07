import api, { unwrapList, unwrapItem } from './axios';

export const getStudents = async (params) => {
  const res = await api.get('/students', { params });
  return unwrapList(res.data);
};
export const getStudent = async (id) => {
  const res = await api.get(`/students/${id}`);
  return unwrapItem(res.data);
};
export const createStudent = async (data) => {
  const res = await api.post('/students', data);
  return unwrapItem(res.data);
};
export const updateStudent = async (id, data) => {
  const res = await api.patch(`/students/${id}`, data);
  return unwrapItem(res.data);
};
export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return unwrapItem(res.data);
};
export const bulkImportStudents = async (formData) => {
  const res = await api.post('/students/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};
export const transferStudent = async (id, data) => {
  const res = await api.post(`/students/${id}/transfer`, data);
  return unwrapItem(res.data);
};
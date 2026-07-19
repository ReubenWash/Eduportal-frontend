import api, { unwrapList, unwrapItem } from './axios';

// GET /staff/export  (returns blob)
export const exportStaff = async (params) => {
  const res = await api.get('/staff/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// POST /staff/import-excel
export const importStaffExcel = async (formData) => {
  const res = await api.post('/staff/import-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// GET /staff
export const getStaff = async (params) => {
  const res = await api.get('/staff', { params });
  return unwrapList(res.data);
};

// GET /staff/:id
export const getStaffMember = async (id) => {
  const res = await api.get(`/staff/${id}`);
  return unwrapItem(res.data);
};

// POST /staff
export const createStaff = async (data) => {
  const res = await api.post('/staff', data);
  return unwrapItem(res.data);
};

// PATCH /staff/:id
export const updateStaff = async (id, data) => {
  const res = await api.patch(`/staff/${id}`, data);
  return unwrapItem(res.data);
};

// DELETE /staff/:id
export const deleteStaff = async (id) => {
  const res = await api.delete(`/staff/${id}`);
  return unwrapItem(res.data);
};

// POST /staff/:id/assign  (assign subjects/classes to a staff member)
export const assignStaff = async (id, data) => {
  const res = await api.post(`/staff/${id}/assign`, data);
  return unwrapItem(res.data);
};

// Alias kept for backward-compatibility with existing page imports
export const assignSubjects = assignStaff;

// DELETE /staff/:id/assign  (remove a subject/class assignment)
export const unassignStaff = async (id, data) => {
  const res = await api.delete(`/staff/${id}/assign`, { data });
  return unwrapItem(res.data);
};
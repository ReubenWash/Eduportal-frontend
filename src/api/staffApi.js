// frontend/src/api/staffApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── EXPORT ────────────────────────────────────────────────────
export const exportStaff = async (params) => {
  const res = await api.get('/staff/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

// ─── IMPORT ────────────────────────────────────────────────────
export const importStaffExcel = async (formData) => {
  const res = await api.post('/staff/import-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// ─── LIST ──────────────────────────────────────────────────────
export const getStaff = async (params) => {
  const res = await api.get('/staff', { params });
  return unwrapList(res.data);
};

export const getStaffMember = async (id) => {
  const res = await api.get(`/staff/${id}`);
  return unwrapItem(res.data);
};

// ─── CRUD ──────────────────────────────────────────────────────
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

// ─── ASSIGNMENTS ──────────────────────────────────────────────
export const assignSubjects = async (id, data) => {
  const res = await api.post(`/staff/${id}/assign`, data);
  return unwrapItem(res.data);
};

export const unassignSubject = async (id, data) => {
  const res = await api.delete(`/staff/${id}/assign`, { data });
  return unwrapItem(res.data);
};
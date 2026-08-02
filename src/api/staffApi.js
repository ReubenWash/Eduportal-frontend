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

// ─── CRUD (School Admin + Super Admin) ──────────────────────
export const createStaff = async (data) => {
  // Clean data before sending
  const cleanData = {};
  if (data.firstName) cleanData.firstName = data.firstName.trim();
  if (data.lastName) cleanData.lastName = data.lastName.trim();
  if (data.email) cleanData.email = data.email.trim().toLowerCase();
  if (data.role) cleanData.role = data.role;
  if (data.phone) cleanData.phone = data.phone.trim();
  if (data.gender) cleanData.gender = data.gender;
  if (data.qualification) cleanData.qualification = data.qualification.trim();
  
  console.log('📤 Creating staff with data:', cleanData);
  
  const res = await api.post('/staff', cleanData);
  return unwrapItem(res.data);
};

export const updateStaff = async (id, data) => {
  // Clean data before sending
  const cleanData = {};
  if (data.firstName) cleanData.firstName = data.firstName.trim();
  if (data.lastName) cleanData.lastName = data.lastName.trim();
  if (data.email) cleanData.email = data.email.trim().toLowerCase();
  if (data.role) cleanData.role = data.role;
  if (data.phone) cleanData.phone = data.phone.trim();
  if (data.gender) cleanData.gender = data.gender;
  if (data.qualification) cleanData.qualification = data.qualification.trim();
  
  console.log('📤 Updating staff with data:', cleanData);
  
  const res = await api.patch(`/staff/${id}`, cleanData);
  return unwrapItem(res.data);
};

export const deleteStaff = async (id) => {
  console.log('📤 Deactivating staff:', id);
  const res = await api.delete(`/staff/${id}`);
  return unwrapItem(res.data);
};

// ─── ASSIGNMENTS (School Admin + Super Admin) ──────────────
export const assignSubjects = async (id, data) => {
  // ✅ Ensure the data has the correct structure
  const payload = {
    subjectId: data.subjectId || data.subject,
    classId: data.classId || data.class
  };
  
  // Validate required fields
  if (!payload.subjectId) {
    throw new Error('Subject ID is required');
  }
  if (!payload.classId) {
    throw new Error('Class ID is required');
  }
  
  console.log('📤 Assigning subject with payload:', payload);
  
  const res = await api.post(`/staff/${id}/assign`, payload);
  return unwrapItem(res.data);
};

export const unassignSubject = async (id, data) => {
  const payload = {
    subjectId: data.subjectId || data.subject,
    classId: data.classId || data.class
  };
  
  // Validate required fields
  if (!payload.subjectId) {
    throw new Error('Subject ID is required');
  }
  if (!payload.classId) {
    throw new Error('Class ID is required');
  }
  
  console.log('📤 Unassigning subject with payload:', payload);
  
  const res = await api.delete(`/staff/${id}/assign`, { data: payload });
  return unwrapItem(res.data);
};

// ─── SUPER ADMIN ONLY ──────────────────────────────────────────
export const getAllStaff = async (params) => {
  const res = await api.get('/staff/admin/all', { params });
  return unwrapItem(res.data);
};

export const getStaffBySchool = async (schoolId, params) => {
  const res = await api.get(`/staff/admin/school/${schoolId}`, { params });
  return unwrapItem(res.data);
};

export const getStaffStats = async () => {
  const res = await api.get('/staff/admin/stats');
  return unwrapItem(res.data);
};

// ─── BULK OPERATIONS ──────────────────────────────────────────
export const bulkAssignSubjects = async (id, assignments) => {
  // assignments: [{ subjectId, classId }, ...]
  const promises = assignments.map(assignment => 
    assignSubjects(id, assignment)
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  return {
    total: results.length,
    successful,
    failed,
    results
  };
};

// ─── EXPORT DEFAULT ────────────────────────────────────────────
export default {
  // School Admin + Super Admin
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  assignSubjects,
  unassignSubject,
  bulkAssignSubjects,
  exportStaff,
  importStaffExcel,
  
  // Super Admin Only
  getAllStaff,
  getStaffBySchool,
  getStaffStats,
};
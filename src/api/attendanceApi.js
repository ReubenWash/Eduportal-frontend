// frontend/src/api/attendanceApi.js
import api, { unwrapList, unwrapItem } from './axios';

// ─── LIST ──────────────────────────────────────────────────────
export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return unwrapList(res.data);
};

export const getAttendanceSummary = async (params) => {
  const res = await api.get('/attendance/summary', { params });
  return unwrapItem(res.data);
};

export const getAttendanceAnalytics = async (params) => {
  const res = await api.get('/attendance/analytics', { params });
  return unwrapList(res.data);
};

// ─── MARK ──────────────────────────────────────────────────────
export const markAttendance = async (data) => {
  // Clean data before sending
  const cleanData = {
    studentId: data.studentId,
    classId: data.classId,
    termId: data.termId,
    date: data.date || new Date().toISOString().split('T')[0],
    status: data.status,
    note: data.note || null,
  };
  
  console.log('📤 Marking attendance:', cleanData);
  
  const res = await api.post('/attendance', cleanData);
  return unwrapItem(res.data);
};

// ─── BULK MARK ──────────────────────────────────────────────────
export const bulkMarkAttendance = async (data) => {
  // Ensure data has the correct structure
  const cleanData = {
    classId: data.classId,
    termId: data.termId,
    date: data.date || new Date().toISOString().split('T')[0],
    records: data.records.map(r => ({
      studentId: r.studentId || r.id, // Handle both field names
      status: r.status || 'PRESENT',
      note: r.note || null,
    }))
  };
  
  console.log('📤 Sending bulk attendance:', cleanData);
  
  const res = await api.post('/attendance/bulk', cleanData);
  return unwrapItem(res.data);
};

// ─── UPDATE ────────────────────────────────────────────────────
export const updateAttendance = async (id, data) => {
  const cleanData = {
    status: data.status,
    note: data.note || null,
  };
  
  const res = await api.patch(`/attendance/${id}`, cleanData);
  return unwrapItem(res.data);
};

// ─── EXPORT DEFAULT ────────────────────────────────────────────
export default {
  getAttendance,
  getAttendanceSummary,
  getAttendanceAnalytics,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
};
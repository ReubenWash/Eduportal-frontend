// frontend/src/api/attendanceApi.js
import api, { unwrapList, unwrapItem } from './axios';
import { cacheData, cachedRequest, readCachedData } from '../utils/offlineStore';
import { isNetworkFailure, queueOfflineMutation } from '../utils/offlineSync';

// ─── LIST ──────────────────────────────────────────────────────
export const getAttendance = async (params) => {
  return cachedRequest('attendance', params, async () => {
    const res = await api.get('/attendance', { params });
    return unwrapList(res.data);
  });
};

export const getAttendanceSummary = async (params) => {
  return cachedRequest('attendance-summary', params, async () => {
    const res = await api.get('/attendance/summary', { params });
    return unwrapItem(res.data);
  });
};

export const getAttendanceAnalytics = async (params) => {
  return cachedRequest('attendance-analytics', params, async () => {
    const res = await api.get('/attendance/analytics', { params });
    return unwrapList(res.data);
  });
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
  
  try {
    const res = await api.post('/attendance', cleanData);
    return unwrapItem(res.data);
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    return queueOfflineMutation({
      dedupeKey: `attendance:${cleanData.classId}:${cleanData.date}:${cleanData.studentId}`,
      method: 'post',
      url: '/attendance',
      data: cleanData,
    });
  }
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
  
  try {
    const res = await api.post('/attendance/bulk', cleanData);
    return unwrapItem(res.data);
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    const queued = queueOfflineMutation({
      dedupeKey: `attendance-bulk:${cleanData.classId}:${cleanData.termId}:${cleanData.date}`,
      method: 'post',
      url: '/attendance/bulk',
      data: cleanData,
    });
    const cached = readCachedData('attendance', { classId: cleanData.classId, date: cleanData.date, termId: cleanData.termId }) || [];
    const byStudent = new Map(cached.map(record => [record.studentId, record]));
    cleanData.records.forEach(record => byStudent.set(record.studentId, {
      ...(byStudent.get(record.studentId) || {}),
      ...record,
      classId: cleanData.classId,
      termId: cleanData.termId,
      date: cleanData.date,
    }));
    cacheData('attendance', { classId: cleanData.classId, date: cleanData.date, termId: cleanData.termId }, Array.from(byStudent.values()));
    return { ...queued, marked: cleanData.records.length };
  }
};

// ─── UPDATE ────────────────────────────────────────────────────
export const updateAttendance = async (id, data) => {
  const cleanData = {
    status: data.status,
    note: data.note || null,
  };
  
  try {
    const res = await api.patch(`/attendance/${id}`, cleanData);
    return unwrapItem(res.data);
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    return queueOfflineMutation({
      dedupeKey: `attendance-record:${id}`,
      method: 'patch',
      url: `/attendance/${id}`,
      data: cleanData,
    });
  }
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
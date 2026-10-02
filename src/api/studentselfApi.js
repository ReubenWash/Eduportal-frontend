import api, { unwrapList, unwrapItem } from './axios';
import { normalizeStudent } from './studentsApi';

// GET /students/me  — logged-in student's own profile
export const getMyProfile = async () => {
  const res = await api.get('/students/me');
  const profile = normalizeStudent(unwrapItem(res.data));
  const guardianLink = profile?.guardians?.find(link => link.isPrimary) || profile?.guardians?.[0];
  const guardian = guardianLink?.guardian || guardianLink;
  return {
    ...profile,
    guardianName: profile?.guardianName || [guardian?.firstName, guardian?.lastName].filter(Boolean).join(' '),
    guardianContact: profile?.guardianContact || guardian?.phone || '',
  };
};

// GET /students/me/report-cards
export const getMyReportCards = async () => {
  const res = await api.get('/students/me/report-cards');
  return unwrapList(res.data);
};

// GET /students/me/grades
export const getMyGrades = async (params) => {
  const res = await api.get('/students/me/grades', { params });
  return unwrapList(res.data);
};

// GET /students/me/attendance
export const getMyAttendance = async () => {
  const res = await api.get('/students/me/attendance');
  return unwrapItem(res.data);
};
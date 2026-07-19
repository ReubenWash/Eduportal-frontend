import api, { unwrapList, unwrapItem } from './axios';
import { normalizeStudent } from './studentsApi';

// GET /students/me  — logged-in student's own profile
export const getMyProfile = async () => {
  const res = await api.get('/students/me');
  return normalizeStudent(unwrapItem(res.data));
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
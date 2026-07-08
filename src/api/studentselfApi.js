import api, { unwrapList, unwrapItem } from './axios';

// NOTE: same caveat as parentApi.js — these "self" endpoints for a
// logged-in STUDENT user are not confirmed to exist on the backend yet:
//   GET /students/me
//   GET /students/me/report-cards
//   GET /students/me/grades
//   GET /students/me/timetable

export const getMyProfile = async () => {
  const res = await api.get('/students/me');
  return unwrapItem(res.data);
};

export const getMyReportCards = async () => {
  const res = await api.get('/students/me/report-cards');
  return unwrapList(res.data);
};

export const getMyGrades = async (params) => {
  const res = await api.get('/students/me/grades', { params });
  return unwrapList(res.data);
};

export const getMyTimetable = async () => {
  const res = await api.get('/students/me/timetable');
  return unwrapList(res.data);
};
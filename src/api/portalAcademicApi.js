import api, { unwrapItem, unwrapList } from './axios';

const childPath = (studentId) => `/guardians/me/children/${studentId}`;

export const getChildTimetable = async (studentId) => {
  const res = await api.get(`${childPath(studentId)}/timetable`);
  return unwrapItem(res.data);
};

export const getChildAssignments = async (studentId) => {
  const res = await api.get(`${childPath(studentId)}/assignments`);
  return unwrapList(res.data);
};

export const getChildTeacherContact = async (studentId) => {
  const res = await api.get(`${childPath(studentId)}/teacher-contact`);
  return unwrapItem(res.data);
};

export const getChildConductLog = async (studentId) => {
  const res = await api.get(`${childPath(studentId)}/conduct-log`);
  return unwrapList(res.data);
};

export const getClassTimetable = async (classId, params = {}) => {
  const res = await api.get(`/timetable/classes/${classId}`, { params });
  return unwrapItem(res.data);
};

export const getTeacherTimetable = async (params = {}) => {
  const res = await api.get('/timetable/teachers/me', { params });
  return unwrapItem(res.data);
};

export const saveTimetableSlot = async (data) => {
  const res = await api.post('/timetable/slots', data);
  return unwrapItem(res.data);
};

export const getAssignments = async (params = {}) => {
  const res = await api.get('/assignments', { params });
  return unwrapList(res.data);
};

export const createAssignment = async (data) => {
  const res = await api.post('/assignments', data);
  return unwrapItem(res.data);
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return unwrapList(res.data);
};

export const submitAssignment = async (assignmentId, data) => {
  const res = await api.post(`/assignments/${assignmentId}/submissions`, data);
  return unwrapItem(res.data);
};

export const gradeAssignmentSubmission = async (submissionId, data) => {
  const res = await api.patch(`/assignments/submissions/${submissionId}`, data);
  return unwrapItem(res.data);
};

export const getConductIncidents = async (params = {}) => {
  const res = await api.get('/discipline/incidents', { params });
  return unwrapList(res.data);
};

export const createConductIncident = async (data) => {
  const res = await api.post('/discipline/incidents', data);
  return unwrapItem(res.data);
};

export const updateConductIncident = async (incidentId, data) => {
  const res = await api.patch(`/discipline/incidents/${incidentId}`, data);
  return unwrapItem(res.data);
};

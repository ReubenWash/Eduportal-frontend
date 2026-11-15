import api, { unwrapItem, unwrapList } from './axios';

export const getLibraryBooks = async (params) => {
  const res = await api.get('/school-operations/books', { params });
  return unwrapList(res.data);
};

export const createLibraryBook = async (data) => {
  const res = await api.post('/school-operations/books', data);
  return unwrapItem(res.data);
};

export const updateLibraryBook = async (id, data) => {
  const res = await api.patch(`/school-operations/books/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteLibraryBook = async (id) => {
  const res = await api.delete(`/school-operations/books/${id}`);
  return unwrapItem(res.data);
};

export const getTransportRoutes = async (params) => {
  const res = await api.get('/school-operations/transport-routes', { params });
  return unwrapList(res.data);
};

export const createTransportRoute = async (data) => {
  const res = await api.post('/school-operations/transport-routes', data);
  return unwrapItem(res.data);
};

export const updateTransportRoute = async (id, data) => {
  const res = await api.patch(`/school-operations/transport-routes/${id}`, data);
  return unwrapItem(res.data);
};

export const getPayroll = async (params) => {
  const res = await api.get('/school-operations/payroll', { params });
  return unwrapItem(res.data);
};

export const getPayrollStaff = async () => {
  const res = await api.get('/school-operations/payroll/staff');
  return unwrapList(res.data);
};

export const createPayrollEntry = async (data) => {
  const res = await api.post('/school-operations/payroll', data);
  return unwrapItem(res.data);
};

export const markPayrollEntryPaid = async (id) => {
  const res = await api.patch(`/school-operations/payroll/${id}/paid`);
  return unwrapItem(res.data);
};

export const getSchoolAnnouncements = async () => {
  const res = await api.get('/school-operations/announcements');
  return unwrapList(res.data);
};

export const downloadSchoolDataExport = async () => {
  const res = await api.get('/school-operations/export', { responseType: 'blob' });
  return res.data;
};

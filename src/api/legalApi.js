import api, { unwrapList, unwrapItem } from './axios';

// Get all legal documents
export const getLegalDocuments = async (params = {}) => {
  const res = await api.get('/admin/cms/legal', { params });
  return unwrapList(res.data);
};

// Get a single legal document by ID
export const getLegalDocumentById = async (id) => {
  const res = await api.get(`/admin/cms/legal/${id}`);
  return unwrapItem(res.data);
};

// Get legal document by type (privacy, terms, cookie, etc.)
export const getLegalDocumentByType = async (type) => {
  const res = await api.get(`/cms/legal/${type}`);
  return unwrapItem(res.data);
};

// Create a new legal document
export const createLegalDocument = async (data) => {
  const res = await api.post('/admin/cms/legal', data);
  return unwrapItem(res.data);
};

// Update a legal document
export const updateLegalDocument = async (id, data) => {
  const res = await api.patch(`/admin/cms/legal/${id}`, data);
  return unwrapItem(res.data);
};

// Delete a legal document
export const deleteLegalDocument = async (id) => {
  const res = await api.delete(`/admin/cms/legal/${id}`);
  return unwrapItem(res.data);
};

// Get consent logs
export const getConsentLogs = async (params = {}) => {
  const res = await api.get('/admin/cms/legal/consent-logs', { params });
  return unwrapList(res.data);
};
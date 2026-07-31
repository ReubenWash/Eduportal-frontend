import api, { unwrapList, unwrapItem } from './axios';

// POST /documents/upload (multipart)
export const uploadDocument = async (formData) => {
  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// GET /documents
export const getDocuments = async (params) => {
  const res = await api.get('/documents', { params });
  return unwrapList(res.data);
};

// GET /documents/:id
export const getDocument = async (id) => {
  const res = await api.get(`/documents/${id}`);
  return unwrapItem(res.data);
};

// DELETE /documents/:id
export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return unwrapItem(res.data);
};

// GET /documents/download/:id
export const downloadDocument = async (id) => {
  const res = await api.get(`/documents/download/${id}`, {
    responseType: 'blob',
  });
  return res.data;
};

// PATCH /documents/:id (update document metadata)
export const updateDocument = async (id, data) => {
  const res = await api.patch(`/documents/${id}`, data);
  return unwrapItem(res.data);
};

// GET /documents/categories
export const getDocumentCategories = async () => {
  const res = await api.get('/documents/categories');
  return unwrapList(res.data);
};

// POST /documents/bulk-delete
export const bulkDeleteDocuments = async (ids) => {
  const res = await api.post('/documents/bulk-delete', { ids });
  return unwrapItem(res.data);
};
import api, { unwrapList, unwrapItem } from './axios';

// POST /documents/upload  (multipart)
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

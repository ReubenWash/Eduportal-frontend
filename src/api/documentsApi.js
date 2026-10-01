import api, { unwrapList, unwrapItem } from './axios';

// A fixed list rather than a backend lookup — `category` is a free-text
// field on Document, not an enum, so there's nothing for a /categories
// endpoint to usefully return beyond this.
export const DOCUMENT_CATEGORIES = [
  'Birth Certificate',
  'ID Card',
  'Certificate',
  'Medical Record',
  'Report',
  'Other',
];

// POST /documents/upload (multipart)
// data: { file, studentId?, staffId?, guardianId?, category? }
export const uploadDocument = async (data) => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.studentId) formData.append('studentId', data.studentId);
  if (data.staffId) formData.append('staffId', data.staffId);
  if (data.guardianId) formData.append('guardianId', data.guardianId);
  if (data.category) formData.append('category', data.category);

  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

// GET /documents?studentId=&staffId=&guardianId=&category=
export const getDocuments = async (params) => {
  const res = await api.get('/documents', { params });
  return unwrapList(res.data);
};

// GET /documents/:id
export const getDocument = async (id) => {
  const res = await api.get(`/documents/${id}`);
  return unwrapItem(res.data);
};

// PATCH /documents/:id — currently just re-categorizing a document
export const updateDocument = async (id, data) => {
  const res = await api.patch(`/documents/${id}`, data);
  return unwrapItem(res.data);
};

// DELETE /documents/:id
export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return unwrapItem(res.data);
};

// POST /documents/bulk-delete
export const bulkDeleteDocuments = async (ids) => {
  const res = await api.post('/documents/bulk-delete', { ids });
  return unwrapItem(res.data);
};
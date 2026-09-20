import api, { unwrapList, unwrapItem } from './axios';

export const getMediaFiles = async (params = {}) => {
  const res = await api.get('/admin/media', { params });
  const body = res.data;
  const payload = body?.data ?? body;
  if (payload && payload.data && Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return unwrapList(body);
};

export const uploadMediaFile = async (formData) => {
  const res = await api.post('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapItem(res.data);
};

export const deleteMediaFile = async (idOrPublicId) => {
  const payload = typeof idOrPublicId === 'string' && idOrPublicId.includes('/')
    ? { publicId: idOrPublicId }
    : { documentId: idOrPublicId };
  const res = await api.post('/admin/media/delete', payload);
  return unwrapItem(res.data);
};

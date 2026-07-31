import api, { unwrapItem } from './axios';

// Upload a single file to Cloudinary via backend
export const uploadPhoto = async (formData) => {
  const res = await api.post('/upload/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapItem(res.data);
};

// Upload multiple files
export const uploadMultiple = async (formData) => {
  const res = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapItem(res.data);
};

// Upload document
export const uploadDocument = async (formData) => {
  const res = await api.post('/upload/document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapItem(res.data);
};
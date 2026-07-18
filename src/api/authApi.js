import api from './axios';

// Use the same base URL as your axios instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eduportal-backend-rorj.onrender.com/api/v1';

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData } };
  }

  const result = await response.json();
  return result.data; // ✅ unwrap to { accessToken, user }
};

export const getPublicSettings = async () => {
  const response = await api.get('/admin/config/public');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

export const verifyEmail = async (code) => {
  const response = await api.post('/auth/verify-email', { code });
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch('/auth/change-password', data);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/schools/register', {
    name: data.schoolName,
    email: data.email,
    password: data.password,
    region: data.region,
    district: data.district,
    address: data.address,
    headmasterName: data.name,
    plan: data.plan,
  });
  return response.data;
};
import api, { unwrapItem } from './axios';

// POST /auth/login
export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  // envelope: { success, data: { accessToken, user } }
  return unwrapItem(res.data);
};

// POST /auth/refresh  (called automatically by axios interceptor)
export const refreshToken = async () => {
  const res = await api.post('/auth/refresh', {}, { withCredentials: true });
  return unwrapItem(res.data);
};

// POST /auth/logout
export const logout = async () => {
  const res = await api.post('/auth/logout');
  return unwrapItem(res.data);
};

// POST /auth/forgot-password
export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return unwrapItem(res.data);
};

// POST /auth/reset-password
export const resetPassword = async (token, password) => {
  const res = await api.post('/auth/reset-password', { token, password });
  return unwrapItem(res.data);
};

// GET /auth/verify-email/:token
export const verifyEmail = async (token) => {
  const res = await api.get(`/auth/verify-email/${token}`);
  return unwrapItem(res.data);
};

// GET /auth/me  — returns the currently logged-in user's profile
export const getMe = async () => {
  const res = await api.get('/auth/me');
  return unwrapItem(res.data);
};

// PATCH /auth/change-password
export const changePassword = async (data) => {
  const res = await api.patch('/auth/change-password', data);
  return unwrapItem(res.data);
};

// POST /schools/register  (school onboarding)
export const register = async (data) => {
  const res = await api.post('/schools/register', {
    name: data.schoolName,
    email: data.email,
    password: data.password,
    region: data.region,
    district: data.district,
    address: data.address,
    headmasterName: data.name,
    plan: data.plan,
  });
  return unwrapItem(res.data);
};

// GET /admin/config/public  — public platform settings (no auth required)
export const getPublicSettings = async () => {
  const res = await api.get('/admin/config/public');
  return unwrapItem(res.data);
};
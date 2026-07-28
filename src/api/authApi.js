import api, { unwrapItem } from './axios';

// POST /auth/login
export const login = async (credentials) => {
  try {
    const res = await api.post('/auth/login', credentials);
    // envelope: { success, data: { accessToken, user } }
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

// POST /auth/refresh  (called automatically by axios interceptor)
export const refreshToken = async () => {
  try {
    const res = await api.post('/auth/refresh', {}, { withCredentials: true });
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

// POST /auth/logout
export const logout = async () => {
  try {
    const res = await api.post('/auth/logout');
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// POST /auth/forgot-password
export const forgotPassword = async (email) => {
  try {
    const res = await api.post('/auth/forgot-password', { email });
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

// POST /auth/reset-password
export const resetPassword = async (token, password) => {
  try {
    const res = await api.post('/auth/reset-password', { token, password });
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// POST /auth/verify-email  (body: { code })
export const verifyEmail = async (code) => {
  try {
    const res = await api.post('/auth/verify-email', { code });
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Verify email error:', error);
    throw error;
  }
};

// GET /auth/me  — returns the currently logged-in user's profile
export const getMe = async () => {
  try {
    const res = await api.get('/auth/me');
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// PATCH /auth/change-password
export const changePassword = async (data) => {
  try {
    const res = await api.patch('/auth/change-password', data);
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// POST /schools/register  (school onboarding)
export const register = async (data) => {
  try {
    console.log('📝 Register API called with:', {
      name: data.schoolName,
      email: data.email,
      region: data.region,
      district: data.district,
      plan: data.plan
    });

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

    console.log('✅ Register API response:', res.data);

    // Return the unwrapped data
    const result = unwrapItem(res.data);
    console.log('✅ Unwrapped result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Register API error:', error);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    throw error;
  }
};

// GET /admin/config/public  — public platform settings (no auth required)
export const getPublicSettings = async () => {
  try {
    const res = await api.get('/admin/config/public');
    return unwrapItem(res.data);
  } catch (error) {
    console.error('Get public settings error:', error);
    throw error;
  }
};
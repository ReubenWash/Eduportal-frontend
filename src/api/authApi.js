import api from './axios';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const forgotPassword = async (email) => {
  // Mock forgot password
  return new Promise(resolve => setTimeout(() => resolve({ message: 'Success' }), 800));
};

export const resetPassword = async (token, password) => {
  // Mock reset password
  return new Promise(resolve => setTimeout(() => resolve({ message: 'Success' }), 800));
};

export const verifyEmail = async (token) => {
  // Mock verify email
  return new Promise(resolve => setTimeout(() => resolve({ message: 'Success' }), 800));
};

export const register = async (data) => {
  try {
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
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: "Mock registration successful.",
        data: {
          id: 'school_mock_' + Date.now(),
          name: data.schoolName,
          status: 'PENDING',
          plan: data.plan,
        }
      }), 800));
    }
    throw error;
  }
};
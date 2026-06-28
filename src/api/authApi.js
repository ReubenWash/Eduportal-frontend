import api from './axios';

// Use the same base URL as your axios instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eduportal-backend-rorj.onrender.com/api/v1';

export const login = async (credentials) => {
  console.log('🔐 Login attempt with:', credentials);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData } };
  }

  const data = await response.json();
  console.log('✅ Login successful:', data);
  return data;
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
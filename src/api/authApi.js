import api from './axios';

// Mock users for each role (used when backend is offline)
const DEMO_USERS = {
  'superadmin@school.com': { id: '1', name: 'Super Admin',       email: 'superadmin@school.com', role: 'SUPER_ADMIN',      schoolId: 'school_1' },
  'admin@school.com':      { id: '2', name: 'School Admin',      email: 'admin@school.com',      role: 'SCHOOL_ADMIN',     schoolId: 'school_1' },
  'teacher@school.com':    { id: '3', name: 'Mr. Kofi Mensah',   email: 'teacher@school.com',    role: 'CLASS_TEACHER',    schoolId: 'school_1' },
  'subject@school.com':    { id: '4', name: 'Ms. Ama Asante',    email: 'subject@school.com',    role: 'SUBJECT_TEACHER',  schoolId: 'school_1' },
  'guardian@school.com':   { id: '5', name: 'Mrs. Akua Osei',    email: 'guardian@school.com',   role: 'PARENT',          schoolId: 'school_1', children: [{ id: '1', name: 'John Doe', class: 'JHS1 A' }] },
};

export const login = async (credentials) => {
  const demoUser = DEMO_USERS[credentials.email];
  if (demoUser) {
    return new Promise(resolve => setTimeout(() => resolve({
      accessToken: 'mock_token_' + demoUser.role,
      user: demoUser,
    }), 600));
  }
  // Fallback: try real API
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

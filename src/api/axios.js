import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response unwrapping helpers ─────────────────────────────────
// Backend envelope is always { success, message, data }.
// List endpoints additionally nest as { data: { data: [...], pagination } }.
// These helpers mean every api/*.js file (and every page) gets clean,
// predictable data regardless of which shape a given endpoint uses —
// this is the fix for the recurring "x.filter/map is not a function"
// crashes that were happening across Schools, Classes, etc.

export function unwrapList(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && body.data && Array.isArray(body.data.data)) return body.data.data;
  return [];
}

export function unwrapItem(body) {
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
}

// ── Session Management ─────────────────────────────────────────
const SESSION_TIMEOUT = 14 * 24 * 60 * 60 * 1000; // 14 days

const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('lastActivity');
  sessionStorage.clear();
};

const redirectToLogin = (reason) => {
  const currentPath = window.location.pathname;
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  
  if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/legal')) {
    const redirectUrl = reason ? `/login?reason=${reason}` : '/login';
    window.location.href = redirectUrl;
  }
};

// ── Request Interceptor ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Check session inactivity
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    
    if (lastActivity && (now - parseInt(lastActivity, 10)) > SESSION_TIMEOUT) {
      clearSession();
      redirectToLogin('session_expired');
      return Promise.reject(new Error('Session expired due to inactivity'));
    }
    
    // Update last activity
    localStorage.setItem('lastActivity', now.toString());

    // Attach access token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Handle 403 (Forbidden) - School status issues ──────────
    if (error.response && error.response.status === 403) {
      const message = error.response?.data?.message || '';
      
      // Check if it's a school status issue
      const schoolStatusKeywords = [
        'school is not verified',
        'school is not active',
        'school registration is pending',
        'school account has been suspended',
        'school account has been deactivated',
        'school registration has been rejected',
        'pending approval',
        'school is not active'
      ];
      
      const isSchoolStatusError = schoolStatusKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isSchoolStatusError) {
        // Clear session and redirect with reason
        clearSession();
        redirectToLogin('school_inactive');
        return Promise.reject(new Error(message));
      }
      
      // For other 403 errors, just pass through
      return Promise.reject(error);
    }

    // ── Handle 401 (Unauthorized) - Token refresh ──────────────
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const newAccessToken = response.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed - clear session and redirect
        clearSession();
        
        // Check if it's a school status issue from refresh
        const message = refreshError.response?.data?.message || '';
        if (message.toLowerCase().includes('school') && 
            (message.toLowerCase().includes('active') || 
             message.toLowerCase().includes('verified') || 
             message.toLowerCase().includes('pending'))) {
          redirectToLogin('school_inactive');
        } else {
          redirectToLogin('session_expired');
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
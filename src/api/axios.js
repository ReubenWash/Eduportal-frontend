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

// Always attach the current token from localStorage on every request.
api.interceptors.request.use(
  (config) => {
    // Check 14 days inactivity
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    if (lastActivity && (now - parseInt(lastActivity, 10)) > 14 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired due to inactivity'));
    }
    
    // Update last activity
    localStorage.setItem('lastActivity', now.toString());

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
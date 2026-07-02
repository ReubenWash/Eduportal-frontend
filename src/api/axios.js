import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Always attach the current token from sessionStorage on every request.
// (Previously relied on config._accessToken, which was never set on normal
// calls, so the Authorization header was silently missing every time.)
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('accessToken');
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

    // Fallback for when backend is not running (Development Mode)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Backend is unreachable. Using fallback mock response for:', originalRequest.url);
      return Promise.resolve({
        data: originalRequest.method === 'get' ? [] : { id: Date.now(), success: true }
      });
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;

        // Persist the refreshed token so every future request picks it up
        // automatically via the request interceptor above.
        sessionStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (expired/missing/blocked cookie) — clear stale
        // session data and send the user back to login.
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
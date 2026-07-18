import { createContext, useContext, useState, useCallback } from 'react';
import { login, register, forgotPassword, resetPassword, verifyEmail } from '../api/authApi';

const AuthContext = createContext();

// Safely read a JSON value from localStorage without ever throwing
function safeGetJSON(key) {
  const raw = localStorage.getItem(key);
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key); // clear corrupted data so this never loops
    return null;
  }
}

// Safely read a plain string value from localStorage
function safeGetString(key) {
  const raw = localStorage.getItem(key);
  return raw && raw !== 'undefined' && raw !== 'null' ? raw : null;
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => safeGetString('accessToken'));
  const [user, setUser] = useState(() => safeGetJSON('user'));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (credentials, onSuccess) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(credentials);

      // Guard against malformed/unexpected API responses
      if (!data?.accessToken || !data?.user) {
        throw new Error('Malformed login response from server');
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      // Persist to localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('lastActivity', Date.now().toString());
      onSuccess?.(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  }, []);

  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await register(userData);

      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('lastActivity', Date.now().toString());
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    // Refresh logic is handled by axios interceptor
    return accessToken;
  }, [accessToken]);

  const setToken = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, error, setError, login: handleLogin, register: handleRegister, logout: handleLogout, refreshToken, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
import { createContext, useContext, useState, useCallback } from 'react';
import { login, register, forgotPassword, resetPassword, verifyEmail } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'));
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (credentials, onSuccess) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
      // Persist to sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
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
    // Clear sessionStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  }, []);

  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await register(userData);
      setAccessToken(data.accessToken);
      setUser(data.user);
      // (Optional – you may want to add sessionStorage here too)
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
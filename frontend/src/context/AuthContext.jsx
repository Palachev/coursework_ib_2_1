import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api, { setUnauthorizedHandler } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onUnauthorized = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/login', { replace: true });
    };

    setUnauthorizedHandler(onUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);

    const me = await api.get('/auth/me');
    setUser(me.data);
  };

  const register = async (email, password) => {
    const fullName = email.split('@')[0] || 'User';
    await api.post('/auth/register', { email, password, full_name: fullName });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

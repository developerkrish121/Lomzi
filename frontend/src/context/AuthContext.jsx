import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/context/authContextValue';
import { apiClient } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';

function getError(error) {
  return new Error(
    error.response?.data?.error?.message || 'Unable to complete the request. Please try again.',
  );
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      if (error.response?.status !== 401) throw getError(error);
      setCurrentUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    const expireSession = () => {
      setCurrentUser(null);
      queryClient.clear();
    };
    window.addEventListener('quickbasket:unauthorized', expireSession);
    return () => window.removeEventListener('quickbasket:unauthorized', expireSession);
  }, []);

  const authenticate = useCallback(async (path, values) => {
    try {
      const { data } = await apiClient.post(path, values);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw getError(error);
    }
  }, []);

  const login = useCallback((values) => authenticate('/auth/login', values), [authenticate]);
  const adminLogin = useCallback(
    (values) => authenticate('/auth/admin/login', values),
    [authenticate],
  );
  const register = useCallback((values) => authenticate('/auth/register', values), [authenticate]);
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setCurrentUser(null);
      queryClient.clear();
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      loading,
      login,
      adminLogin,
      logout,
      register,
      refreshUser,
    }),
    [adminLogin, currentUser, loading, login, logout, refreshUser, register],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

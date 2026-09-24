import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

const getStoredUser = () => authService.getCurrentUser();
const getStoredRole = () => {
  const u = authService.getCurrentUser();
  const r = localStorage.getItem('agri_user_role') || u?.role;
  return r ? String(r).toLowerCase().replace('role_', '').trim() : null;
};
const getStoredToken = () => localStorage.getItem('agri_auth_token');

const defaultAuthValue = {
  user: null,
  role: null,
  loading: false,
  login: async (credentials, selectedRole) => authService.login(credentials, selectedRole),
  register: async (userData) => authService.register(userData),
  logout: () => authService.logout(),
  isAuthenticated: false
};

export const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [role, setRole] = useState(getStoredRole);
  const [loading, setLoading] = useState(false);

  // Synchronize state with storage changes or external updates
  const syncAuth = useCallback(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    const storedRole = getStoredRole();

    if (token && storedUser) {
      setUser(storedUser);
      setRole(storedRole || 'farmer');
    } else if (!token) {
      setUser(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('agri_auth_changed', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('agri_auth_changed', syncAuth);
    };
  }, [syncAuth]);

  const login = async (credentials, selectedRole) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials, selectedRole || credentials?.role);
      const authenticatedUser = res.user || getStoredUser();
      const normRole = String(authenticatedUser?.role || selectedRole || 'farmer')
        .toLowerCase()
        .replace('role_', '')
        .trim();

      setUser(authenticatedUser);
      setRole(normRole);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('agri_auth_changed'));
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      const registeredUser = res.user || getStoredUser();
      const normRole = String(registeredUser?.role || userData?.role || 'farmer')
        .toLowerCase()
        .replace('role_', '')
        .trim();

      setUser(registeredUser);
      setRole(normRole);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('agri_auth_changed'));
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agri_auth_changed'));
    }
  };

  // Determine authentication: Active if state has user OR valid token+user exists in localStorage
  const currentToken = getStoredToken();
  const effectiveUser = user || (currentToken ? getStoredUser() : null);
  const effectiveRole = role || (effectiveUser ? getStoredRole() : null);
  const isAuthenticated = !!(currentToken && effectiveUser);

  const contextValue = useMemo(
    () => ({
      user: effectiveUser,
      role: effectiveRole,
      loading,
      login,
      register,
      logout,
      isAuthenticated
    }),
    [effectiveUser, effectiveRole, loading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};

export default AuthContext;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

import authService from '../services/authService';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const auth = useAuth() || {};
  const { user, role, loading, isAuthenticated } = auth;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner message="Verifying authentication session..." />
      </div>
    );
  }

  // Double check both context AND localStorage token/user to guarantee no false redirects
  const storedToken = localStorage.getItem('agri_auth_token');
  const storedUser = authService.getCurrentUser();
  const storedRole = localStorage.getItem('agri_user_role');

  const effectiveUser = user || storedUser;
  const isAuth = isAuthenticated || !!(storedToken && effectiveUser);

  if (!isAuth) {
    console.warn(
      `%c===== PROTECTED ROUTE REDIRECT (UNAUTHENTICATED) =====\nPath: ${window.location.pathname}\nUser in context: ${!!user}\nToken in localStorage: ${!!storedToken}\nRedirecting to /login\n========================================================`,
      'color: #f59e0b; font-weight: bold;'
    );
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = (role || storedRole || effectiveUser?.role || 'farmer')
    .toLowerCase()
    .replace('role_', '')
    .trim();
  const reqRole = (requiredRole || '').toLowerCase().replace('role_', '').trim();

  if (reqRole && effectiveRole && effectiveRole !== reqRole) {
    console.warn(
      `%c===== PROTECTED ROUTE ROLE MISMATCH =====\nRequired: ${reqRole}\nActual: ${effectiveRole}\nPath: ${window.location.pathname}\n==========================================`,
      'color: #f59e0b; font-weight: bold;'
    );
    return (
      <Navigate
        to={
          effectiveRole === 'admin'
            ? '/admin/dashboard'
            : effectiveRole === 'mandi'
            ? '/mandi/dashboard'
            : effectiveRole === 'buyer'
            ? '/buyer/dashboard'
            : '/farmer/dashboard'
        }
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, LogOut, Sparkles, ShieldCheck } from 'lucide-react';

import authService from '../../services/authService';

export const Navbar = () => {
  const auth = useAuth() || {};
  const storedUser = authService.getCurrentUser();
  const storedToken = localStorage.getItem('agri_auth_token');
  const storedRole = localStorage.getItem('agri_user_role');

  const user = auth.user || storedUser;
  const role = auth.role || storedRole || user?.role || 'farmer';
  const isAuthenticated = auth.isAuthenticated || !!(storedToken && user);
  const logout = auth.logout || (() => authService.logout());
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof logout === 'function') logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent">
              KrishiSetu
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Market Intelligence
            </span>
          </div>
        </Link>

        {/* User Auth controls */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800">
                  {user?.name || user?.companyName || 'User'}
                </span>
                <span className="text-xs text-emerald-700 capitalize flex items-center justify-end gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {role} Portal
                </span>
              </div>
              
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-xs">
                {(user?.name || user?.companyName || 'U').charAt(0)}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-700 hover:text-emerald-700 px-3 py-1.5 text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

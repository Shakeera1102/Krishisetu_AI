import apiClient, { USE_MOCK } from './api.js';
import centralDatabase from './centralDatabase.js';

export const authService = {
  login: async (credentials, selectedRole) => {
    const inputIdentifier = (credentials.email || credentials.emailOrMobile || '').trim().toLowerCase();
    const inputPassword = (credentials.password || '').trim();
    const targetRole = (selectedRole || credentials.role || 'farmer').toLowerCase().replace('role_', '').trim();

    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 150));

      // 1. Fetch live users directly from disk via dev server middleware
      let diskUsers = [];
      try {
        const res = await fetch('/api/db/users');
        if (res.ok) {
          diskUsers = await res.json();
          if (Array.isArray(diskUsers) && diskUsers.length > 0) {
            centralDatabase.setUsers(diskUsers);
          }
        }
      } catch {}

      const registeredUsers = centralDatabase.getUsers();
      const customMandis = centralDatabase.getMandis();
      let localUsers = [];
      try {
        const stored = localStorage.getItem('agri_registered_users');
        if (stored) localUsers = JSON.parse(stored);
      } catch {}

      const allCandidates = [
        ...diskUsers,
        ...customMandis.map((m) => ({
          ...m,
          email: (m.email || '').trim().toLowerCase(),
          password: (m.password || 'govt123').trim(),
          role: 'mandi'
        })),
        ...localUsers,
        ...registeredUsers
      ];

      let foundUser = allCandidates.find(
        (u) =>
          (u.email && u.email.toLowerCase().trim() === inputIdentifier) ||
          (u.name && u.name.toLowerCase().trim() === inputIdentifier) ||
          (u.companyName && u.companyName.toLowerCase().trim() === inputIdentifier) ||
          (u.mobile && u.mobile.toLowerCase().trim() === inputIdentifier) ||
          (u.mobile && u.mobile.replace(/\D/g, '') === inputIdentifier.replace(/\D/g, ''))
      );

      // System Admin guaranteed account
      if (!foundUser && (inputIdentifier === 'admin@gmail.com' || inputIdentifier === 'admin')) {
        foundUser = {
          id: 'u-admin',
          name: 'System Administrator',
          companyName: 'KrishiSetu Headquarters',
          email: 'admin@gmail.com',
          password: 'admin123',
          role: 'admin',
          mobile: '+91 99999 00000',
          state: 'Maharashtra',
          district: 'National',
          createdDate: '2026-08-31'
        };
      }

      if (!foundUser) {
        throw new Error('User account not found. Please verify your email/mobile or register your account.');
      }

      const storedPassword = (foundUser.password || 'govt123').trim();
      const isPasswordMatch =
        storedPassword === inputPassword ||
        (storedPassword === '123' && inputPassword === '123456') ||
        (storedPassword === '123456' && inputPassword === '123') ||
        (storedPassword === 'govt123' && inputPassword === 'govt123') ||
        !inputPassword;

      if (!isPasswordMatch) {
        throw new Error('Incorrect password. Please verify your credentials.');
      }

      // ROLE ENFORCEMENT & MISMATCH GUARD:
      const allMandis = centralDatabase.getMandis() || [];
      const userIsMandi =
        foundUser.role === 'mandi' ||
        Boolean(foundUser.name?.includes('APMC') || foundUser.companyName?.includes('APMC')) ||
        allMandis.some(
          (m) =>
            (m.id && m.id === foundUser.id) ||
            (m.email && m.email.toLowerCase() === foundUser.email?.toLowerCase()) ||
            (m.name && m.name.toLowerCase() === foundUser.name?.toLowerCase())
        );

      if (targetRole === 'farmer' && userIsMandi) {
        throw new Error(
          "This is an official APMC Mandi account. Please select the 'Mandi Official' option above to sign in to your Mandi Portal."
        );
      }

      if (targetRole === 'mandi' && !userIsMandi && foundUser.role === 'farmer') {
        throw new Error(
          "This is a registered Farmer account. Please select the 'Farmer' option above to sign in to your Farmer Portal."
        );
      }

      const actualUserRole = (foundUser.role || (userIsMandi ? 'mandi' : targetRole) || 'farmer')
        .toLowerCase()
        .replace('role_', '')
        .trim();

      const token = 'mock-jwt-token-sih2026-' + Date.now();
      localStorage.setItem('agri_auth_token', token);
      localStorage.setItem('agri_user', JSON.stringify({ ...foundUser, role: actualUserRole }));
      localStorage.setItem('agri_user_role', actualUserRole);

      return { success: true, token, user: { ...foundUser, role: actualUserRole } };
    }

    // Real API backend integration
    try {
      const response = await apiClient.post('/auth/login', {
        emailOrMobile: inputIdentifier,
        password: inputPassword
      });

      const data = response.data || response;
      const formattedRole = (data.role || 'farmer').replace('ROLE_', '').toLowerCase();
      
      const user = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: formattedRole,
        profileId: data.profileId
      };

      localStorage.setItem('agri_auth_token', data.token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      localStorage.setItem('agri_user_role', user.role);

      return { success: true, token: data.token, user };
    } catch (err) {
      throw new Error(err.message || 'Login failed. Please check your credentials.');
    }
  },

  register: async (userData) => {
    const normalizedRole = (userData.role || 'farmer').toLowerCase();
    const formattedUser = {
      id: 'u-' + Date.now(),
      ...userData,
      name: userData.companyName || userData.name || 'User',
      role: normalizedRole
    };

    // Purge previous user session flags on new registration
    localStorage.removeItem('agri_active_crop_cleared');
    localStorage.removeItem('agri_farmer_crop');

    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      centralDatabase.registerUser(formattedUser);

      const token = 'mock-jwt-token-sih2026-' + Date.now();
      localStorage.setItem('agri_auth_token', token);
      localStorage.setItem('agri_user', JSON.stringify(formattedUser));
      localStorage.setItem('agri_user_role', formattedUser.role);

      return { success: true, token, user: formattedUser };
    }

    try {
      const response = await apiClient.post('/auth/register', {
        ...userData,
        role: normalizedRole.toUpperCase()
      });

      const data = response.data || response;
      const user = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: normalizedRole,
        profileId: data.profileId
      };

      centralDatabase.registerUser(user);

      localStorage.setItem('agri_auth_token', data.token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      localStorage.setItem('agri_user_role', user.role);

      return { success: true, token: data.token, user };
    } catch (err) {
      throw new Error(err.message || 'Registration failed. Please try again.');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('agri_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  forgotPassword: async (identifier) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) {
      throw new Error('Please enter your registered email or mobile number.');
    }

    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const users = centralDatabase.getUsers();
      const cleanDigits = cleanId.replace(/\D/g, '');
      const found = users.find(
        (u) =>
          u.email?.toLowerCase() === cleanId ||
          u.mobile?.toLowerCase() === cleanId ||
          (cleanDigits.length >= 10 && u.mobile?.replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );
      if (!found) {
        throw new Error('No registered account found with this email or mobile number. Please check your credentials or register a new account.');
      }
      return { success: true, user: found, message: `Account verified for ${found.name} (${found.role}). You can now reset your password.` };
    }

    try {
      const res = await apiClient.post('/auth/forgot-password', { emailOrMobile: cleanId });
      return res.data || res;
    } catch (err) {
      throw new Error(err.message || 'No registered account found with this email or mobile number.');
    }
  },

  resetPassword: async (identifier, newPassword) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (newPassword || '').trim();

    if (!cleanPass || cleanPass.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 250));
      const users = centralDatabase.getUsers();
      const cleanDigits = cleanId.replace(/\D/g, '');
      const userIndex = users.findIndex(
        (u) =>
          u.email?.toLowerCase() === cleanId ||
          u.mobile?.toLowerCase() === cleanId ||
          (cleanDigits.length >= 10 && u.mobile?.replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );
      if (userIndex === -1) {
        throw new Error('Account not found. Please verify your credentials.');
      }

      users[userIndex].password = cleanPass;
      centralDatabase.setUsers(users);

      return { success: true, message: 'Password updated successfully! You can now sign in with your new password.' };
    }

    try {
      const res = await apiClient.post('/auth/reset-password', { emailOrMobile: cleanId, newPassword: cleanPass });
      return res.data || res;
    } catch (err) {
      throw new Error(err.message || 'Failed to update password. Please try again.');
    }
  },

  logout: () => {
    console.warn(
      `%c===== FRONTEND LOGOUT CALLED =====\nCaller Stack: ${new Error().stack}\nToken before logout: ${localStorage.getItem('agri_auth_token')}\nUser before logout: ${localStorage.getItem('agri_user')}\n====================================`,
      'color: #dc2626; font-weight: bold;'
    );
    localStorage.removeItem('agri_auth_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_user_role');
    localStorage.removeItem('agri_active_crop_cleared');
    localStorage.removeItem('agri_farmer_crop');
    localStorage.removeItem('agri_farmer_location');
  }
};

export default authService;

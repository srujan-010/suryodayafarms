import { create } from 'zustand';
import api from '../utils/api';

export const useAdminAuthStore = create((set, get) => ({
  adminUser: null,
  isAdminAuthenticated: false,
  isAdminLoading: false,
  isAdminAuthChecked: false,
  adminError: null,

  clearAdminError: () => set({ adminError: null }),

  // 1. ADMIN LOGIN ACTIONS
  adminLogin: async (email, password) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success && response.user) {
        // Enforce administrative role protection on login
        if (response.user.role !== 'ADMIN') {
          set({
            adminUser: null,
            isAdminAuthenticated: false,
            isAdminLoading: false,
            adminError: 'Access denied. Administrative credentials required.'
          });
          return { success: false, message: 'Access denied. Administrative credentials required.' };
        }

        // Store JWT token inside localStorage to isolate it from customer cookies
        if (response.token) {
          localStorage.setItem('adminToken', response.token);
        }

        set({
          adminUser: response.user,
          isAdminAuthenticated: true,
          isAdminLoading: false,
          isAdminAuthChecked: true,
          adminError: null
        });

        return { success: true, message: 'Admin authenticated successfully.' };
      }

      return { success: false, message: response.message || 'Authentication failed.' };
    } catch (error) {
      set({ adminError: error.message, isAdminLoading: false });
      return { success: false, message: error.message || 'An error occurred.' };
    }
  },

  // 2. CHECK SESSION STATUS
  checkAdminAuth: async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      set({
        adminUser: null,
        isAdminAuthenticated: false,
        isAdminLoading: false,
        isAdminAuthChecked: true
      });
      return;
    }

    set({ isAdminLoading: true, adminError: null });
    try {
      // Fetch /auth/me profile (API interceptor automatically attaches Bearer token)
      const response = await api.get('/auth/me');
      
      if (response.success && response.user && response.user.role === 'ADMIN') {
        set({
          adminUser: response.user,
          isAdminAuthenticated: true,
          isAdminLoading: false,
          isAdminAuthChecked: true
        });
      } else {
        // If token invalid or user is not ADMIN, purge it
        localStorage.removeItem('adminToken');
        set({
          adminUser: null,
          isAdminAuthenticated: false,
          isAdminLoading: false,
          isAdminAuthChecked: true,
          adminError: response.user ? 'Access denied. Administrative privileges required.' : null
        });
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
      set({
        adminUser: null,
        isAdminAuthenticated: false,
        isAdminLoading: false,
        isAdminAuthChecked: true
      });
    }
  },

  // 3. ADMIN LOGOUT
  adminLogout: async () => {
    set({ isAdminLoading: true, adminError: null });
    try {
      // Optionally notify backend, but local token destruction is primary
      localStorage.removeItem('adminToken');
      set({
        adminUser: null,
        isAdminAuthenticated: false,
        isAdminLoading: false,
        isAdminAuthChecked: true,
        adminError: null
      });
    } catch (error) {
      localStorage.removeItem('adminToken');
      set({
        adminUser: null,
        isAdminAuthenticated: false,
        isAdminLoading: false,
        isAdminAuthChecked: true
      });
    }
  }
}));

import { create } from 'zustand';
import api from '../utils/api';
import { useWishlistStore } from './useWishlistStore';
import { useCartStore } from './useCartStore';
import { useFeedbackStore } from './useFeedbackStore';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthChecked: false,
  isAuthModalOpen: false,
  isLoginRequiredModalOpen: false,
  loginRequiredMessage: '',
  authModalTab: 'login', // 'login' | 'signup'
  checkoutResumeRedirect: null,
  error: null,

  // Set modal and redirect states
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open, error: null }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  setLoginRequiredModalOpen: (open, message = '') => set({ isLoginRequiredModalOpen: open, loginRequiredMessage: open ? message : '' }),
  setCheckoutResumeRedirect: (redirect) => set({ checkoutResumeRedirect: redirect }),
  clearError: () => set({ error: null }),

  // 1. REGISTER NEW USER
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    useFeedbackStore.getState().showLoader('Creating your account...');
    try {
      const response = await api.post('/auth/register', { name, email, password });
      useFeedbackStore.getState().hideLoader();
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true,
          isAuthModalOpen: false
        });
        useFeedbackStore.getState().showToast('✅ Account created successfully', 'success');
        return { success: true, message: response.message || 'Account created successfully.' };
      }
      useFeedbackStore.getState().showToast(`❌ Registration failed: ${response.message || 'Error'}`, 'error');
      return { success: false, message: response.message || 'Registration failed.' };
    } catch (error) {
      useFeedbackStore.getState().hideLoader();
      set({ error: error.message, isLoading: false });
      useFeedbackStore.getState().showToast(`❌ Registration failed: ${error.message}`, 'error');
      return { success: false, message: error.message || 'An error occurred.' };
    }
  },

  // 2. LOGIN USER
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    useFeedbackStore.getState().showLoader('Logging in...');
    try {
      const response = await api.post('/auth/login', { email, password });
      useFeedbackStore.getState().hideLoader();
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true,
          isAuthModalOpen: false
        });
        useFeedbackStore.getState().showToast('✅ Logged in successfully', 'success');
        return { success: true, message: response.message || 'Logged in successfully.' };
      }
      useFeedbackStore.getState().showToast(`❌ Login failed: ${response.message || 'Error'}`, 'error');
      return { success: false, message: response.message || 'Login failed.' };
    } catch (error) {
      useFeedbackStore.getState().hideLoader();
      set({ error: error.message, isLoading: false });
      useFeedbackStore.getState().showToast(`❌ Login failed: ${error.message}`, 'error');
      return { success: false, message: error.message || 'An error occurred.' };
    }
  },

  // 3. CHECK SESSIONS
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthChecked: true
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true
      });
    }
  },

  // 4. LOGOUT USER
  logout: async () => {
    set({ isLoading: true, error: null });
    useFeedbackStore.getState().showLoader('Logging out...');
    try {
      await api.post('/auth/logout');
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clearWishlist();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true
      });
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Logged out successfully', 'success');
    } catch (error) {
      useFeedbackStore.getState().hideLoader();
      set({ error: error.message, isLoading: false });
      useFeedbackStore.getState().showToast(`❌ Logout failed: ${error.message}`, 'error');
      throw error;
    }
  }
}));

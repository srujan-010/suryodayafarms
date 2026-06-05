import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  checkoutResumeRedirect: string | null;
  
  // Actions
  setAuthModalOpen: (open: boolean) => void;
  setCheckoutResumeRedirect: (redirect: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Async thunks / handlers
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts with true to allow loading profile on mount
  isAuthModalOpen: false,
  checkoutResumeRedirect: null,

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setCheckoutResumeRedirect: (redirect) => set({ checkoutResumeRedirect: redirect }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ isLoading: loading }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          set({ user: data.user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (err) {
      console.error('[AuthStore CheckSession Error]', err);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        set({ user: data.user, isAuthenticated: true, isAuthModalOpen: false });
        return { success: true, message: data.message || 'Logged in successfully.' };
      } else {
        return { success: false, message: data.message || 'Invalid email or password.' };
      }
    } catch (err: any) {
      console.error('[AuthStore Login Error]', err);
      return { success: false, message: err.message || 'An error occurred during login.' };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        set({ user: data.user, isAuthenticated: true, isAuthModalOpen: false });
        return { success: true, message: data.message || 'Account created successfully.' };
      } else {
        return { success: false, message: data.message || 'Registration failed.' };
      }
    } catch (err: any) {
      console.error('[AuthStore Register Error]', err);
      return { success: false, message: err.message || 'An error occurred during registration.' };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        set({ user: null, isAuthenticated: false });
      }
    } catch (err) {
      console.error('[AuthStore Logout Error]', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));

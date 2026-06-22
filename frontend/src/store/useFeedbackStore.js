import { create } from 'zustand';

export const useFeedbackStore = create((set, get) => ({
  toasts: [],
  isLoading: false,
  loadingText: 'Loading... Please wait...',

  // Show a success, error, warning, or info toast
  showToast: (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    // Add new toast
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },

  // Remove toast by id
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  // Page-level Loading Overlay
  showLoader: (text = 'Loading... Please wait...') => {
    set({ isLoading: true, loadingText: text });
  },

  hideLoader: () => {
    set({ isLoading: false });
  }
}));

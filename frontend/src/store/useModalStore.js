import { create } from 'zustand';

export const useModalStore = create((set, get) => ({
  isOpen: false,
  type: 'info', // 'success' | 'error' | 'confirm' | 'warning' | 'info'
  title: '',
  description: '',
  primaryLabel: 'Confirm',
  secondaryLabel: 'Cancel',
  resolvePromise: null,

  showModal: (config) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: config.type || 'info',
        title: config.title || '',
        description: config.description || '',
        primaryLabel: config.primaryLabel || (config.type === 'confirm' ? 'Yes' : 'OK'),
        secondaryLabel: config.secondaryLabel !== undefined ? config.secondaryLabel : (config.type === 'confirm' ? 'Cancel' : null),
        resolvePromise: resolve,
      });
    });
  },

  closeModal: () => {
    const resolve = get().resolvePromise;
    if (resolve) resolve(false);
    set({ isOpen: false, resolvePromise: null });
  },

  confirmAction: () => {
    const resolve = get().resolvePromise;
    if (resolve) resolve(true);
    set({ isOpen: false, resolvePromise: null });
  },

  // Easy-to-use promise helpers
  alert: (title, description = '', type = 'info') => {
    return get().showModal({
      title,
      description,
      type,
      primaryLabel: 'OK',
      secondaryLabel: null
    });
  },

  confirm: (title, description = '', type = 'confirm', primaryLabel = 'Confirm', secondaryLabel = 'Cancel') => {
    return get().showModal({
      title,
      description,
      type,
      primaryLabel,
      secondaryLabel
    });
  }
}));

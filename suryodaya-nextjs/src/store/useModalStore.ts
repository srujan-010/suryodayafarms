import { create } from 'zustand';

export type ModalType = 'success' | 'error' | 'confirm' | 'warning' | 'info';

interface ModalConfig {
  type?: ModalType;
  title: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string | null;
}

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string | null;
  resolvePromise: ((value: boolean) => void) | null;

  showModal: (config: ModalConfig) => Promise<boolean>;
  closeModal: () => void;
  confirmAction: () => void;
  alert: (title: string, description?: string, type?: ModalType) => Promise<boolean>;
  confirm: (
    title: string,
    description?: string,
    type?: ModalType,
    primaryLabel?: string,
    secondaryLabel?: string
  ) => Promise<boolean>;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: 'info',
  title: '',
  description: '',
  primaryLabel: 'Confirm',
  secondaryLabel: 'Cancel',
  resolvePromise: null,

  showModal: (config) => {
    return new Promise<boolean>((resolve) => {
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

  alert: (title, description = '', type = 'info') => {
    return get().showModal({
      title,
      description,
      type,
      primaryLabel: 'OK',
      secondaryLabel: null,
    });
  },

  confirm: (title, description = '', type = 'confirm', primaryLabel = 'Confirm', secondaryLabel = 'Cancel') => {
    return get().showModal({
      title,
      description,
      type,
      primaryLabel,
      secondaryLabel,
    });
  },
}));

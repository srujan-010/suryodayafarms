import { create } from 'zustand';
import api from '../utils/api';

export const useSettingsStore = create((set, get) => ({
  settings: {
    companyName: 'Suryodaya Farms',
    brandName: 'Suryodaya Farms & Organics',
    email: 'care@suryodayafarms.com',
    phone: '+91 9100422140',
    address: 'Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal, Medchal (Malkajgiri), Telangana – 500039',
    websiteUrl: 'https://suryodayafarms.com',
    gstNumber: '36AAAAA0000A1Z5',
    registrationDetails: 'FSSAI Licence No: 11524999000342 | Soil Bio-Dynamic System ISO 14001',
    socialTwitter: 'https://twitter.com/suryodayafarms',
    socialFacebook: 'https://facebook.com/suryodayafarms',
    socialInstagram: 'https://instagram.com/suryodayafarms',
    socialYoutube: 'https://youtube.com/suryodayafarms'
  },
  settingsLoaded: false,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    // Return cached settings if already loaded
    if (get().settingsLoaded) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/public/settings');
      if (response.success && response.settings) {
        set({ settings: response.settings, settingsLoaded: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch settings, using client fallbacks:', err.message);
      set({ isLoading: false, error: err.message });
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/admin/settings', newSettings);
      if (response.success) {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          isLoading: false
        }));
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  }
}));

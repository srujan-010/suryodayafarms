import { create } from 'zustand';
import api from '../utils/api';

export const useWishlistStore = create((set, get) => ({
  wishlistItems: [],
  isLoading: false,
  error: null,

  // 1. FETCH USER WISHLIST
  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/orders/wishlist');
      set({
        wishlistItems: response.wishlist || [],
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 2. TOGGLE PRODUCT
  toggleWishlist: async (productId) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/orders/wishlist/${productId}`);
      // Fetch fresh items to keep in sync
      const res = await api.get('/orders/wishlist');
      set({
        wishlistItems: res.wishlist || [],
        isLoading: false
      });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Helper: check if product is wishlisted
  isWishlisted: (productId) => {
    return get().wishlistItems.some((item) => item.productId === productId);
  },

  // 3. CLEAR WISHLIST
  clearWishlist: () => {
    set({ wishlistItems: [] });
  }
}));

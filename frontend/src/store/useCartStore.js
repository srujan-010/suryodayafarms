import { create } from 'zustand';
import api from '../utils/api';
import { useModalStore } from './useModalStore';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  subtotal: 0,
  coupon: null,
  isLoading: false,
  error: null,

  // Helper: Recalculate Subtotal based on active items
  calculateSubtotal: (items) => {
    let subtotal = 0;
    items.forEach((item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      subtotal += price * item.quantity;
    });
    return subtotal;
  },

  // 1. FETCH USER CART
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/orders/cart');
      const items = response.cartItems || [];
      const sub = get().calculateSubtotal(items);
      
      set({
        cartItems: items,
        subtotal: sub,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 2. ADD ITEM TO CART
  addItem: async (productId, variantId = null, quantity = 1, silent = false) => {
    const realProductId = (productId && typeof productId === 'object') ? productId.id : productId;
    const realProductName = (productId && typeof productId === 'object') ? productId.name : 'Item';
    
    set({ isLoading: true, error: null });
    try {
      await api.post('/orders/cart', { productId: realProductId, variantId, quantity });
      // Fetch fresh cart items to keep in sync
      const response = await api.get('/orders/cart');
      const items = response.cartItems || [];
      const sub = get().calculateSubtotal(items);
      
      set({
        cartItems: items,
        subtotal: sub,
        isLoading: false
      });

      if (!silent) {
        // Show beautiful premium confirmation modal
        useModalStore.getState().alert(
          'Added to Basket 🛒',
          `"${realProductName}" has been added to your organic basket successfully!`,
          'success'
        );
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      if (!silent) {
        useModalStore.getState().alert(
          'Action Failed',
          error.message,
          'error'
        );
      }
      throw error;
    }
  },

  // Alias for addToCart (used in some detail components)
  addToCart: async (productId, variantId = null, quantity = 1, silent = false) => {
    return get().addItem(productId, variantId, quantity, silent);
  },

  // 3. UPDATE QUANTITY
  updateQuantity: async (itemId, quantity) => {
    try {
      await api.put(`/orders/cart/${itemId}`, { quantity });
      // Fast local update for visual smoothness
      const updatedItems = get().cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: parseInt(quantity, 10) } : item
      );
      const sub = get().calculateSubtotal(updatedItems);
      
      set({
        cartItems: updatedItems,
        subtotal: sub,
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // 4. REMOVE ITEM
  removeItem: async (itemId) => {
    try {
      await api.delete(`/orders/cart/${itemId}`);
      const remainingItems = get().cartItems.filter((item) => item.id !== itemId);
      const sub = get().calculateSubtotal(remainingItems);
      
      set({
        cartItems: remainingItems,
        subtotal: sub,
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // 5. VALIDATE AND APPLY COUPON
  applyCoupon: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/orders/coupon/validate', {
        code,
        orderValue: get().subtotal
      });
      
      set({
        coupon: response.coupon,
        isLoading: false
      });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 6. CLEAR COUPON
  removeCoupon: () => set({ coupon: null }),

  // 7. EMPTY CART
  clearCart: () => set({ cartItems: [], subtotal: 0, coupon: null })
}));

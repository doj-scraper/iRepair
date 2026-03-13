// ============================================
// CellTech Distributor B2B Portal - Cart Store
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/types';
import { MOQ } from '@/lib/validations';

// ====================
// Types
// ====================

export interface CartStoreItem {
  productId: string;
  quantity: number;
  product: Product;
  addedAt: Date;
}

export interface CartStoreState {
  items: CartStoreItem[];
  isLoading: boolean;
}

export interface CartStoreActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItem: (productId: string) => CartStoreItem | undefined;
  hasItem: (productId: string) => boolean;
  setIsLoading: (loading: boolean) => void;
}

export type CartStore = CartStoreState & CartStoreActions;

// ====================
// Helper Functions
// ====================

/**
 * Validates quantity against MOQ (Minimum Order Quantity)
 * @param quantity - The quantity to validate
 * @returns The validated quantity (minimum MOQ)
 */
const validateQuantity = (quantity: number): number => {
  return Math.max(MOQ, Math.floor(quantity));
};

// ====================
// Store
// ====================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      isLoading: false,

      // Actions
      addItem: (product: Product, quantity: number = MOQ) => {
        const validatedQuantity = validateQuantity(quantity);
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === product.id
          );

          if (existingItemIndex > -1) {
            // Update existing item quantity
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingItemIndex];
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + validatedQuantity,
            };
            return { items: updatedItems };
          }

          // Add new item
          const newItem: CartStoreItem = {
            productId: product.id,
            quantity: validatedQuantity,
            product,
            addedAt: new Date(),
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        // If quantity is below MOQ, remove item or set to MOQ
        if (quantity < MOQ) {
          // Remove item if quantity is set below MOQ
          set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
          }));
          return;
        }

        const validatedQuantity = validateQuantity(quantity);

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: validatedQuantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.product.wholesalePrice * item.quantity,
          0
        );
      },

      getItem: (productId: string) => {
        const { items } = get();
        return items.find((item) => item.productId === productId);
      },

      hasItem: (productId: string) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },

      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'celltech-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      // Transform dates when rehydrating from storage
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map((item) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }));
        }
      },
    }
  )
);

// ====================
// Selectors (for optimized re-renders)
// ====================

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartItemCount = (state: CartStore) => state.items.length;
export const selectCartIsEmpty = (state: CartStore) => state.items.length === 0;
export const selectCartIsLoading = (state: CartStore) => state.isLoading;

// Selector for individual item quantity (prevents unnecessary re-renders)
export const selectItemQuantity = (productId: string) => (state: CartStore) =>
  state.items.find((item) => item.productId === productId)?.quantity ?? 0;

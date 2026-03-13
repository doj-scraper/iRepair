// ============================================
// CellTech Distributor B2B Portal - UI Store
// ============================================

import { create } from 'zustand';

// ====================
// Types
// ====================

export interface UIStoreState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isQuickViewOpen: boolean;
  quickViewProductId: string | null;
}

export interface UIStoreActions {
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  closeAll: () => void;
  closeAllModals: () => void;
}

export type UIStore = UIStoreState & UIStoreActions;

// ====================
// Initial State
// ====================

const initialState: UIStoreState = {
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isQuickViewOpen: false,
  quickViewProductId: null,
};

// ====================
// Store
// ====================

export const useUIStore = create<UIStore>()((set, get) => ({
  // Initial State
  ...initialState,

  // Mobile Menu Actions
  toggleMobileMenu: () => {
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
      // Close other panels when opening mobile menu
      isCartOpen: false,
      isSearchOpen: false,
    }));
  },

  openMobileMenu: () => {
    set({
      isMobileMenuOpen: true,
      isCartOpen: false,
      isSearchOpen: false,
    });
  },

  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },

  // Cart Actions
  toggleCart: () => {
    set((state) => ({
      isCartOpen: !state.isCartOpen,
      // Close other panels when opening cart
      isMobileMenuOpen: false,
      isSearchOpen: false,
    }));
  },

  openCart: () => {
    set({
      isCartOpen: true,
      isMobileMenuOpen: false,
      isSearchOpen: false,
    });
  },

  closeCart: () => {
    set({ isCartOpen: false });
  },

  // Search Actions
  toggleSearch: () => {
    set((state) => ({
      isSearchOpen: !state.isSearchOpen,
      // Close other panels when opening search
      isMobileMenuOpen: false,
      isCartOpen: false,
    }));
  },

  openSearch: () => {
    set({
      isSearchOpen: true,
      isMobileMenuOpen: false,
      isCartOpen: false,
    });
  },

  closeSearch: () => {
    set({ isSearchOpen: false });
  },

  // Quick View Actions
  openQuickView: (productId: string) => {
    set({
      isQuickViewOpen: true,
      quickViewProductId: productId,
      // Close other panels
      isMobileMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,
    });
  },

  closeQuickView: () => {
    set({
      isQuickViewOpen: false,
      quickViewProductId: null,
    });
  },

  // Global Actions
  closeAll: () => {
    set({
      isMobileMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,
      isQuickViewOpen: false,
      quickViewProductId: null,
    });
  },

  closeAllModals: () => {
    set({
      isCartOpen: false,
      isSearchOpen: false,
      isQuickViewOpen: false,
      quickViewProductId: null,
    });
  },
}));

// ====================
// Selectors (for optimized re-renders)
// ====================

export const selectIsMobileMenuOpen = (state: UIStore) => state.isMobileMenuOpen;
export const selectIsCartOpen = (state: UIStore) => state.isCartOpen;
export const selectIsSearchOpen = (state: UIStore) => state.isSearchOpen;
export const selectIsQuickViewOpen = (state: UIStore) => state.isQuickViewOpen;
export const selectQuickViewProductId = (state: UIStore) => state.quickViewProductId;
export const selectIsAnyModalOpen = (state: UIStore) =>
  state.isCartOpen || state.isSearchOpen || state.isQuickViewOpen;

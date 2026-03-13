// ============================================
// CellTech Distributor B2B Portal - Search Store
// ============================================

import { create } from 'zustand';
import type { ProductFilters, Brand, PartCategory, QualityGrade, PriceRange } from '@/types';

// ====================
// Types
// ====================

export interface SearchStoreState {
  searchQuery: string;
  filters: ProductFilters;
  isSearching: boolean;
  recentSearches: string[];
}

export interface SearchStoreActions {
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  setBrandFilter: (brand: Brand | Brand[] | undefined) => void;
  setCategoryFilter: (category: PartCategory | PartCategory[] | undefined) => void;
  setQualityFilter: (grade: QualityGrade | QualityGrade[] | undefined) => void;
  setPriceRange: (range: PriceRange | undefined) => void;
  setInStockFilter: (inStock: boolean | undefined) => void;
  setSortBy: (sortBy: ProductFilters['sortBy']) => void;
  clearFilters: () => void;
  clearSearch: () => void;
  resetAll: () => void;
  setIsSearching: (isSearching: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  hasActiveFilters: () => boolean;
}

export type SearchStore = SearchStoreState & SearchStoreActions;

// ====================
// Initial State
// ====================

const initialFilters: ProductFilters = {};

const initialState: SearchStoreState = {
  searchQuery: '',
  filters: initialFilters,
  isSearching: false,
  recentSearches: [],
};

// ====================
// Constants
// ====================

const MAX_RECENT_SEARCHES = 5;

// ====================
// Store
// ====================

export const useSearchStore = create<SearchStore>()((set, get) => ({
  // Initial State
  ...initialState,

  // Actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setFilters: (filters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  setBrandFilter: (brand: Brand | Brand[] | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        brand,
      },
    }));
  },

  setCategoryFilter: (category: PartCategory | PartCategory[] | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        category,
      },
    }));
  },

  setQualityFilter: (grade: QualityGrade | QualityGrade[] | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        qualityGrade: grade,
      },
    }));
  },

  setPriceRange: (priceRange: PriceRange | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        priceRange,
      },
    }));
  },

  setInStockFilter: (inStock: boolean | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        inStock,
      },
    }));
  },

  setSortBy: (sortBy: ProductFilters['sortBy']) => {
    set((state) => ({
      filters: {
        ...state.filters,
        sortBy,
      },
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  clearSearch: () => {
    set({ searchQuery: '' });
  },

  resetAll: () => {
    set(initialState);
  },

  setIsSearching: (isSearching: boolean) => {
    set({ isSearching });
  },

  addRecentSearch: (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    set((state) => {
      // Remove the query if it already exists
      const filteredSearches = state.recentSearches.filter(
        (s) => s.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add to the beginning and limit the size
      const newRecentSearches = [trimmedQuery, ...filteredSearches].slice(
        0,
        MAX_RECENT_SEARCHES
      );

      return { recentSearches: newRecentSearches };
    });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  hasActiveFilters: () => {
    const { filters } = get();
    return (
      filters.brand !== undefined ||
      filters.category !== undefined ||
      filters.qualityGrade !== undefined ||
      filters.priceRange !== undefined ||
      filters.inStock !== undefined
    );
  },
}));

// ====================
// Selectors (for optimized re-renders)
// ====================

export const selectSearchQuery = (state: SearchStore) => state.searchQuery;
export const selectFilters = (state: SearchStore) => state.filters;
export const selectIsSearching = (state: SearchStore) => state.isSearching;
export const selectRecentSearches = (state: SearchStore) => state.recentSearches;
export const selectSortBy = (state: SearchStore) => state.filters.sortBy;

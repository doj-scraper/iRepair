// ============================================
// CellTech Distributor B2B Portal - Stores Index
// ============================================

// Cart Store
export {
  useCartStore,
  selectCartItems,
  selectCartItemCount,
  selectCartIsEmpty,
  selectCartIsLoading,
  selectItemQuantity,
  type CartStoreItem,
  type CartStoreState,
  type CartStoreActions,
  type CartStore,
} from './cart-store';

// Navigation Store
export {
  useNavigationStore,
  selectExpandedNodes,
  selectActiveNodeId,
  selectExpandedNodesArray,
  type NavigationStoreState,
  type NavigationStoreActions,
  type NavigationStore,
} from './navigation-store';

// Search Store
export {
  useSearchStore,
  selectSearchQuery,
  selectFilters,
  selectIsSearching,
  selectRecentSearches,
  selectSortBy,
  type SearchStoreState,
  type SearchStoreActions,
  type SearchStore,
} from './search-store';

// UI Store
export {
  useUIStore,
  selectIsMobileMenuOpen,
  selectIsCartOpen,
  selectIsSearchOpen,
  selectIsQuickViewOpen,
  selectQuickViewProductId,
  selectIsAnyModalOpen,
  type UIStoreState,
  type UIStoreActions,
  type UIStore,
} from './ui-store';

// ============================================
// CellTech Distributor B2B Portal - Navigation Store
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ====================
// Types
// ====================

export interface NavigationStoreState {
  expandedNodes: Set<string>;
  activeNodeId: string | null;
  focusedNodeId: string | null;
}

export interface NavigationStoreActions {
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandPath: (nodeIds: string[]) => void;
  setActiveNode: (nodeId: string | null) => void;
  setFocusedNode: (nodeId: string | null) => void;
  isExpanded: (nodeId: string) => boolean;
  collapseAll: () => void;
  expandAll: (nodeIds: string[]) => void;
}

export type NavigationStore = NavigationStoreState & NavigationStoreActions;

// ====================
// Store
// ====================

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      expandedNodes: new Set<string>(),
      activeNodeId: null,
      focusedNodeId: null,

      // Actions
      toggleNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
          } else {
            newExpanded.add(nodeId);
          }
          return { expandedNodes: newExpanded };
        });
      },

      expandNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          newExpanded.add(nodeId);
          return { expandedNodes: newExpanded };
        });
      },

      collapseNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          newExpanded.delete(nodeId);
          return { expandedNodes: newExpanded };
        });
      },

      expandPath: (nodeIds: string[]) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          nodeIds.forEach((id) => newExpanded.add(id));
          return { expandedNodes: newExpanded };
        });
      },

      setActiveNode: (nodeId: string | null) => {
        set({ activeNodeId: nodeId });
      },

      setFocusedNode: (nodeId: string | null) => {
        set({ focusedNodeId: nodeId });
      },

      isExpanded: (nodeId: string) => {
        return get().expandedNodes.has(nodeId);
      },

      collapseAll: () => {
        set({ expandedNodes: new Set<string>() });
      },

      expandAll: (nodeIds: string[]) => {
        set(() => {
          const newExpanded = new Set<string>(nodeIds);
          return { expandedNodes: newExpanded };
        });
      },
    }),
    {
      name: 'celltech-navigation-storage',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Set
      serialize: (state) => {
        return JSON.stringify({
          expandedNodes: Array.from(state.expandedNodes as Set<string>),
          activeNodeId: state.activeNodeId,
        });
      },
      // Custom deserialization for Set
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          expandedNodes: new Set<string>(parsed.expandedNodes || []),
          activeNodeId: parsed.activeNodeId || null,
          focusedNodeId: null,
        };
      },
      partialize: (state) => ({
        expandedNodes: state.expandedNodes,
        activeNodeId: state.activeNodeId,
      }),
    }
  )
);

// ====================
// Selectors
// ====================

export const selectExpandedNodes = (state: NavigationStore) => state.expandedNodes;
export const selectActiveNodeId = (state: NavigationStore) => state.activeNodeId;
export const selectFocusedNodeId = (state: NavigationStore) => state.focusedNodeId;
export const selectIsNodeExpanded = (nodeId: string) => (state: NavigationStore) =>
  state.expandedNodes.has(nodeId);

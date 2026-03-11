// ============================================
// CellTech Distributor B2B Portal - File Explorer Navigation Tree
// Main tree component with keyboard navigation and ARIA accessibility
// ============================================

'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';
import {
  navigationTree,
  flattenNavigationTree,
  findNodePath,
  type NavigationNode,
  type FlatNavigationNode,
} from '@/lib/navigation-data';
import { MemoizedTreeNode } from './tree-node';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

// ====================
// Types
// ====================

export interface FileExplorerProps {
  className?: string;
  onNodeSelect?: (node: NavigationNode) => void;
  initialActiveId?: string | null;
  showSearch?: boolean;
}

// ====================
// Component
// ====================

export const FileExplorer: React.FC<FileExplorerProps> = ({
  className,
  onNodeSelect,
  initialActiveId,
  showSearch = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    expandedNodes,
    activeNodeId,
    focusedNodeId,
    toggleNode,
    expandNode,
    expandPath,
    setActiveNode,
    setFocusedNode,
  } = useNavigationStore();

  // Handle deep linking - expand tree to show active node
  useEffect(() => {
    if (initialActiveId && !activeNodeId) {
      const path = findNodePath(navigationTree, initialActiveId);
      if (path) {
        // Expand all parent nodes (excluding the target node itself)
        expandPath(path.slice(0, -1));
        setActiveNode(initialActiveId);
        setFocusedNode(initialActiveId);
      }
    }
  }, [initialActiveId, activeNodeId, expandPath, setActiveNode, setFocusedNode]);

  // Filter navigation tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) {
      return navigationTree;
    }

    const query = searchQuery.toLowerCase();

    function filterNodes(nodes: NavigationNode[]): NavigationNode[] {
      return nodes.reduce<NavigationNode[]>((acc, node) => {
        const labelMatch = node.label.toLowerCase().includes(query);

        if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0 || labelMatch) {
            acc.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
            });
          }
        } else if (labelMatch) {
          acc.push(node);
        }

        return acc;
      }, []);
    }

    return filterNodes(navigationTree);
  }, [searchQuery]);

  // Flatten the filtered tree for keyboard navigation
  const flatNodes = useMemo(
    () => flattenNavigationTree(filteredTree, 0, null, expandedNodes),
    [filteredTree, expandedNodes]
  );

  // Get visible nodes (for keyboard navigation within visible area)
  const visibleNodes = useMemo(() => flatNodes, [flatNodes]);

  // Handle navigation
  const handleNavigate = useCallback(
    (node: NavigationNode) => {
      setActiveNode(node.id);
      onNodeSelect?.(node);
    },
    [setActiveNode, onNodeSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = visibleNodes.findIndex((n) => n.id === focusedNodeId);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, visibleNodes.length - 1);
          if (visibleNodes[nextIndex]) {
            setFocusedNode(visibleNodes[nextIndex].id);
          }
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (visibleNodes[prevIndex]) {
            setFocusedNode(visibleNodes[prevIndex].id);
          }
          break;
        }

        case 'ArrowRight': {
          e.preventDefault();
          const currentNode = visibleNodes[currentIndex];
          if (currentNode?.children && currentNode.children.length > 0) {
            if (!expandedNodes.has(currentNode.id)) {
              expandNode(currentNode.id);
            } else {
              // Move to first child
              const firstChild = visibleNodes[currentIndex + 1];
              if (firstChild && firstChild.parentId === currentNode.id) {
                setFocusedNode(firstChild.id);
              }
            }
          }
          break;
        }

        case 'ArrowLeft': {
          e.preventDefault();
          const currentNode = visibleNodes[currentIndex];
          if (currentNode && expandedNodes.has(currentNode.id)) {
            // Collapse current node
            useNavigationStore.getState().collapseNode(currentNode.id);
          } else if (currentNode?.parentId) {
            // Move to parent
            setFocusedNode(currentNode.parentId);
          }
          break;
        }

        case 'Enter':
        case ' ': {
          e.preventDefault();
          const currentNode = visibleNodes[currentIndex];
          if (currentNode) {
            if (currentNode.children && currentNode.children.length > 0) {
              toggleNode(currentNode.id);
            } else {
              handleNavigate(currentNode);
            }
          }
          break;
        }

        case 'Escape': {
          e.preventDefault();
          const currentNode = visibleNodes[currentIndex];
          if (currentNode?.parentId) {
            // Collapse parent and move focus to parent
            useNavigationStore.getState().collapseNode(currentNode.parentId);
            setFocusedNode(currentNode.parentId);
          }
          break;
        }

        case 'Home': {
          e.preventDefault();
          if (visibleNodes[0]) {
            setFocusedNode(visibleNodes[0].id);
          }
          break;
        }

        case 'End': {
          e.preventDefault();
          const lastNode = visibleNodes[visibleNodes.length - 1];
          if (lastNode) {
            setFocusedNode(lastNode.id);
          }
          break;
        }

        case '/':
        case 'f': {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            searchInputRef.current?.focus();
          }
          break;
        }
      }
    },
    [visibleNodes, focusedNodeId, expandedNodes, expandNode, toggleNode, handleNavigate, setFocusedNode]
  );

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  // Auto-expand filtered results
  useEffect(() => {
    if (searchQuery.trim()) {
      // Expand all nodes that have matching children
      const nodeIds = getAllNodeIdsWithMatches(filteredTree, searchQuery.toLowerCase());
      expandPath(nodeIds);
    }
  }, [searchQuery, filteredTree, expandPath]);

  // Focus the container on mount
  useEffect(() => {
    if (containerRef.current && !focusedNodeId) {
      // Set initial focus to first node
      if (visibleNodes[0]) {
        setFocusedNode(visibleNodes[0].id);
      }
    }
  }, [focusedNodeId, visibleNodes, setFocusedNode]);

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col h-full', className)}
      role="tree"
      aria-label="Product catalog navigation"
      aria-multiselectable="false"
      onKeyDown={handleKeyDown}
    >
      {/* Search Input */}
      {showSearch && (
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search
              className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9 text-sm"
              aria-label="Search catalog"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-accent"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tree Content */}
      <ScrollArea className="flex-1">
        <div className="p-2" role="group">
          {visibleNodes.length > 0 ? (
            visibleNodes.map((node) => (
              <MemoizedTreeNode
                key={node.id}
                node={node}
                level={node.level}
                onNavigate={handleNavigate}
                onFocus={(n) => setFocusedNode(n.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Keyboard Shortcuts Help */}
      <div className="p-2 border-t border-border text-xs text-muted-foreground">
        <span className="font-medium">Shortcuts:</span>{' '}
        <span>↑↓ Navigate</span> • <span>←→ Expand/Collapse</span> • <span>Enter Select</span> •{' '}
        <span>Ctrl+/ Search</span>
      </div>
    </div>
  );
};

// ====================
// Helper Functions
// ====================

function getAllNodeIdsWithMatches(
  nodes: NavigationNode[],
  query: string
): string[] {
  const ids: string[] = [];

  function traverse(nodeList: NavigationNode[]): boolean {
    let hasMatch = false;

    for (const node of nodeList) {
      const labelMatch = node.label.toLowerCase().includes(query);
      const childrenMatch = node.children ? traverse(node.children) : false;

      if (labelMatch || childrenMatch) {
        ids.push(node.id);
        hasMatch = true;
      }
    }

    return hasMatch;
  }

  traverse(nodes);
  return ids;
}

// ====================
// Memoized Export
// ====================

export const MemoizedFileExplorer = React.memo(FileExplorer);

MemoizedFileExplorer.displayName = 'FileExplorer';

// ====================
// Export Types
// ====================

export type { NavigationNode, FlatNavigationNode };

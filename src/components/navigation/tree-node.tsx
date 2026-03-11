// ============================================
// CellTech Distributor B2B Portal - Tree Node Component
// Individual tree node with expand/collapse and navigation
// ============================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';
import type { NavigationNode } from '@/lib/navigation-data';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  type LucideIcon,
} from 'lucide-react';

// ====================
// Types
// ====================

export interface TreeNodeProps {
  node: NavigationNode;
  level: number;
  onNavigate?: (node: NavigationNode) => void;
  onFocus?: (node: NavigationNode) => void;
}

// ====================
// Component
// ====================

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  onNavigate,
  onFocus,
}) => {
  const { expandedNodes, activeNodeId, focusedNodeId, toggleNode, setActiveNode, setFocusedNode } =
    useNavigationStore();

  const isExpanded = expandedNodes.has(node.id);
  const isActive = activeNodeId === node.id;
  const isFocused = focusedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  // Get the appropriate icon
  const Icon = node.icon || (hasChildren ? (isExpanded ? FolderOpen : Folder) : File);

  // Handle click on the node
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasChildren) {
      toggleNode(node.id);
    } else if (node.href && onNavigate) {
      onNavigate(node);
    }

    setActiveNode(node.id);
    setFocusedNode(node.id);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();

      if (hasChildren) {
        toggleNode(node.id);
      } else if (node.href && onNavigate) {
        onNavigate(node);
      }

      setActiveNode(node.id);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setFocusedNode(node.id);
    onFocus?.(node);
  };

  // Handle click on chevron (only toggle)
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleNode(node.id);
    }
  };

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      aria-level={level}
      aria-label={node.label}
      data-state={isExpanded ? 'open' : 'closed'}
      data-active={isActive}
      data-focused={isFocused}
      className={cn(
        'group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer',
        'transition-colors duration-150 ease-in-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Hover state
        'hover:bg-primary-light hover:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-primary-light',
        // Active/selected state - emerald green
        isActive && 'bg-primary text-primary-foreground font-medium',
        isActive && 'hover:bg-primary hover:text-primary-foreground',
        // Focused state for keyboard navigation
        isFocused && !isActive && 'ring-2 ring-ring ring-offset-1',
        // Indentation based on level
        level === 0 && 'pl-2',
        level === 1 && 'pl-6',
        level === 2 && 'pl-10',
        level === 3 && 'pl-14'
      )}
      style={{
        paddingLeft: `${0.5 + level * 1}rem`,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      tabIndex={isFocused ? 0 : -1}
    >
      {/* Chevron for expandable nodes */}
      {hasChildren ? (
        <button
          type="button"
          onClick={handleChevronClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              toggleNode(node.id);
            }
          }}
          className={cn(
            'flex-shrink-0 p-0.5 rounded-sm transition-transform duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isActive && 'text-primary-foreground hover:bg-primary-dark'
          )}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      ) : (
        <span className="w-5 flex-shrink-0" aria-hidden="true" />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          'h-4 w-4 flex-shrink-0',
          hasChildren ? 'text-muted-foreground' : 'text-primary',
          isActive && 'text-primary-foreground'
        )}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="flex-grow truncate text-sm">{node.label}</span>

      {/* Product count badge for leaf nodes */}
      {node.productCount !== undefined && (
        <span
          className={cn(
            'flex-shrink-0 px-1.5 py-0.5 text-xs rounded-full',
            'bg-muted text-muted-foreground',
            isActive && 'bg-primary-dark/20 text-primary-foreground'
          )}
          aria-label={`${node.productCount} products`}
        >
          {node.productCount}
        </span>
      )}
    </div>
  );
};

// ====================
// Memoized Export
// ====================

export const MemoizedTreeNode = React.memo(TreeNode);

MemoizedTreeNode.displayName = 'TreeNode';

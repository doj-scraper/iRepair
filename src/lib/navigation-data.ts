// ============================================
// CellTech Distributor B2B Portal - Navigation Data
// Catalog Hierarchy: Brand → Device Model → Part Category → Products
// ============================================

import { Brand, PartCategory } from '@/types';
import {
  Smartphone,
  Battery,
  Camera,
  Usb,
  PanelTop,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

// ====================
// Types
// ====================

export type NavNodeIcon = LucideIcon;

export interface NavigationNode {
  id: string;
  label: string;
  href?: string;
  icon?: NavNodeIcon;
  children?: NavigationNode[];
  type: 'brand' | 'device' | 'category' | 'product';
  productCount?: number;
}

export interface FlatNavigationNode extends NavigationNode {
  level: number;
  parentId: string | null;
  index: number;
}

// ====================
// Icon Mapping for Part Categories
// ====================

export const categoryIcons: Record<PartCategory, NavNodeIcon> = {
  [PartCategory.Screens]: PanelTop,
  [PartCategory.Batteries]: Battery,
  [PartCategory.Cameras]: Camera,
  [PartCategory.ChargingPorts]: Usb,
  [PartCategory.BackGlass]: PanelTop,
  [PartCategory.Other]: Wrench,
};

// ====================
// Device Models by Brand
// ====================

const appleDevices = [
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15 Plus',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 14 Plus',
  'iPhone 14',
  'iPhone 13 Pro Max',
  'iPhone 13 Pro',
  'iPhone 13',
  'iPhone 13 mini',
  'iPhone 12 Pro Max',
  'iPhone 12 Pro',
  'iPhone 12',
  'iPhone 12 mini',
  'iPhone SE (3rd Gen)',
  'iPhone SE (2nd Gen)',
];

const samsungDevices = [
  'Galaxy S24 Ultra',
  'Galaxy S24+',
  'Galaxy S24',
  'Galaxy S23 Ultra',
  'Galaxy S23+',
  'Galaxy S23',
  'Galaxy S22 Ultra',
  'Galaxy S22+',
  'Galaxy S22',
  'Galaxy S21 Ultra',
  'Galaxy S21+',
  'Galaxy S21',
  'Galaxy Z Fold5',
  'Galaxy Z Fold4',
  'Galaxy Z Flip5',
  'Galaxy Z Flip4',
  'Galaxy A54',
  'Galaxy A53',
  'Galaxy A34',
  'Galaxy A33',
];

const motorolaDevices = [
  'Moto G Stylus 5G (2023)',
  'Moto G Power 5G (2023)',
  'Moto G 5G (2023)',
  'Moto G Play (2023)',
  'Moto G Stylus (2022)',
  'Moto G Power (2022)',
  'Moto G Pure',
  'Moto Edge+ (2023)',
  'Moto Edge 30 Ultra',
  'Moto Edge 30 Fusion',
  'Moto Razr+ (2023)',
  'Moto Razr (2022)',
];

const otherDevices = [
  'Google Pixel 8 Pro',
  'Google Pixel 8',
  'Google Pixel 7 Pro',
  'Google Pixel 7',
  'Google Pixel 7a',
  'Google Pixel Fold',
  'OnePlus 12',
  'OnePlus 11',
  'OnePlus Open',
  'Xiaomi 14 Ultra',
  'Xiaomi 14',
  'Xiaomi 13T Pro',
];

// ====================
// Part Categories
// ====================

const categories: { name: PartCategory; count: number }[] = [
  { name: PartCategory.Screens, count: 156 },
  { name: PartCategory.Batteries, count: 89 },
  { name: PartCategory.Cameras, count: 67 },
  { name: PartCategory.ChargingPorts, count: 45 },
  { name: PartCategory.BackGlass, count: 34 },
  { name: PartCategory.Other, count: 23 },
];

// ====================
// Helper Functions
// ====================

function createCategoryNodes(deviceId: string): NavigationNode[] {
  return categories.map((category) => ({
    id: `${deviceId}-${category.name.toLowerCase()}`,
    label: category.name,
    href: `/products?device=${encodeURIComponent(deviceId)}&category=${category.name}`,
    icon: categoryIcons[category.name],
    type: 'category' as const,
    productCount: category.count,
  }));
}

function createDeviceNodes(brandId: string, devices: string[]): NavigationNode[] {
  return devices.map((device) => {
    const deviceId = `${brandId}-${device.toLowerCase().replace(/\s+/g, '-')}`;
    return {
      id: deviceId,
      label: device,
      icon: Smartphone,
      type: 'device' as const,
      children: createCategoryNodes(deviceId),
    };
  });
}

// ====================
// Main Navigation Tree
// ====================

export const navigationTree: NavigationNode[] = [
  {
    id: 'brand-apple',
    label: 'Apple',
    icon: Smartphone,
    type: 'brand',
    children: createDeviceNodes('brand-apple', appleDevices),
  },
  {
    id: 'brand-samsung',
    label: 'Samsung',
    icon: Smartphone,
    type: 'brand',
    children: createDeviceNodes('brand-samsung', samsungDevices),
  },
  {
    id: 'brand-motorola',
    label: 'Motorola',
    icon: Smartphone,
    type: 'brand',
    children: createDeviceNodes('brand-motorola', motorolaDevices),
  },
  {
    id: 'brand-other',
    label: 'Other Brands',
    icon: Smartphone,
    type: 'brand',
    children: createDeviceNodes('brand-other', otherDevices),
  },
];

// ====================
// Flatten Navigation Tree for Keyboard Navigation
// ====================

export function flattenNavigationTree(
  nodes: NavigationNode[],
  level: number = 0,
  parentId: string | null = null,
  expandedNodes: Set<string> = new Set()
): FlatNavigationNode[] {
  const result: FlatNavigationNode[] = [];
  let index = 0;

  for (const node of nodes) {
    const flatNode: FlatNavigationNode = {
      ...node,
      level,
      parentId,
      index,
    };
    result.push(flatNode);
    index++;

    // Only include children if parent is expanded
    if (node.children && expandedNodes.has(node.id)) {
      const childNodes = flattenNavigationTree(
        node.children,
        level + 1,
        node.id,
        expandedNodes
      );
      result.push(...childNodes);
      index += childNodes.length;
    }
  }

  return result;
}

// ====================
// Find Node Path by ID
// ====================

export function findNodePath(
  nodes: NavigationNode[],
  targetId: string,
  path: string[] = []
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...path, node.id];
    }

    if (node.children) {
      const result = findNodePath(node.children, targetId, [...path, node.id]);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

// ====================
// Get All Expandable Node IDs
// ====================

export function getAllExpandableNodeIds(nodes: NavigationNode[]): string[] {
  const ids: string[] = [];

  function traverse(nodeList: NavigationNode[]) {
    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return ids;
}

// ====================
// Brand Labels for Display
// ====================

export const brandLabels: Record<Brand, string> = {
  [Brand.Apple]: 'Apple',
  [Brand.Samsung]: 'Samsung',
  [Brand.Motorola]: 'Motorola',
  [Brand.Other]: 'Other Brands',
};

// ====================
// Category Labels for Display
// ====================

export const categoryLabels: Record<PartCategory, string> = {
  [PartCategory.Screens]: 'Screens & LCDs',
  [PartCategory.Batteries]: 'Batteries',
  [PartCategory.Cameras]: 'Cameras',
  [PartCategory.ChargingPorts]: 'Charging Ports',
  [PartCategory.BackGlass]: 'Back Glass',
  [PartCategory.Other]: 'Other Parts',
};

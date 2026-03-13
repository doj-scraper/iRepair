'use client';

import * as React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCartStore, type CartStoreItem } from '@/stores/cart-store';
import { MOQ } from '@/lib/validations';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Props for the CartItem component
 */
export interface CartItemProps {
  item: CartStoreItem;
  className?: string;
}

/**
 * Get quality badge color based on quality grade
 */
function getQualityBadgeVariant(quality: Product['qualityGrade']): 'default' | 'secondary' | 'outline' {
  switch (quality) {
    case 'OEM':
      return 'default';
    case 'Aftermarket':
      return 'secondary';
    case 'Refurbished':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Get quality badge background color
 */
function getQualityBadgeBg(quality: Product['qualityGrade']): string {
  switch (quality) {
    case 'OEM':
      return 'bg-success text-white hover:bg-success/80';
    case 'Aftermarket':
      return 'bg-warning text-white hover:bg-warning/80';
    case 'Refurbished':
      return 'bg-secondary text-secondary-foreground';
    default:
      return '';
  }
}

/**
 * Individual Cart Item Component
 * Displays product image, name, SKU, price, quantity controls, and remove button
 */
export function CartItem({ item, className }: CartItemProps) {
  const { product, quantity } = item;
  const { updateQuantity, removeItem } = useCartStore();

  // Stock status
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 20;
  const isOutOfStock = product.stockQuantity === 0;
  const isBelowStock = quantity > product.stockQuantity;

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < MOQ) {
      // If quantity goes below MOQ, remove the item
      removeItem(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  // Handle increment
  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    // Cap at available stock
    if (newQuantity <= product.stockQuantity) {
      updateQuantity(product.id, newQuantity);
    }
  };

  // Handle decrement
  const handleDecrement = () => {
    const newQuantity = quantity - 1;
    handleQuantityChange(newQuantity);
  };

  // Handle direct input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  };

  // Calculate line total
  const lineTotal = product.wholesalePrice * quantity;

  return (
    <div
      className={cn(
        'group relative flex gap-4 py-4',
        className
      )}
    >
      {/* Product Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="text-muted-foreground h-8 w-8" />
          </div>
        )}

        {/* Quality Badge Overlay */}
        <Badge
          className={cn(
            'absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-medium',
            getQualityBadgeBg(product.qualityGrade)
          )}
        >
          {product.qualityGrade}
        </Badge>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        {/* Name and SKU */}
        <div className="mb-1">
          <h4 className="text-sm font-medium text-foreground line-clamp-1">
            {product.name}
          </h4>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            {product.sku}
          </p>
        </div>

        {/* Brand and Model */}
        <p className="text-muted-foreground mb-2 text-xs">
          {product.brand} • {product.deviceModel}
        </p>

        {/* Price */}
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-primary text-sm font-semibold">
            ${product.wholesalePrice.toFixed(2)}
          </span>
          <span className="text-muted-foreground text-xs">/ unit</span>
        </div>

        {/* Stock Warning */}
        {(isLowStock || isOutOfStock || isBelowStock) && (
          <div
            className={cn(
              'mb-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs',
              isOutOfStock
                ? 'bg-error/10 text-error'
                : 'bg-warning/10 text-warning'
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {isOutOfStock
                ? 'Out of stock'
                : isBelowStock
                  ? `Only ${product.stockQuantity} available`
                  : `Only ${product.stockQuantity} left`}
            </span>
          </div>
        )}

        {/* Quantity Controls and Remove */}
        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleDecrement}
              disabled={quantity <= MOQ}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min={MOQ}
              max={product.stockQuantity}
              className="h-7 w-14 px-2 text-center text-sm"
              aria-label="Quantity"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleIncrement}
              disabled={quantity >= product.stockQuantity}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Line Total and Remove */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              ${lineTotal.toFixed(2)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-error h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeItem(product.id)}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* MOQ Notice */}
        {quantity === MOQ && (
          <p className="text-muted-foreground mt-1 text-xs">
            Min. order: {MOQ} units
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Memoized Cart Item for performance
 */
export const MemoizedCartItem = React.memo(CartItem);

'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react';
import type { Product, QualityGrade } from '@/types';
import { useCartStore } from '@/stores/cart-store';
import { MOQ } from '@/lib/validations';
import { cn } from '@/lib/utils';

// ====================
// Types
// ====================

export interface ProductCardProps {
  product: Product;
  className?: string;
}

// ====================
// Helper Functions
// ====================

/**
 * Get stock status based on quantity
 */
const getStockStatus = (
  quantity: number
): { label: string; variant: 'success' | 'warning' | 'error'; isLow: boolean; isOut: boolean } => {
  if (quantity === 0) {
    return { label: 'Out of Stock', variant: 'error', isLow: false, isOut: true };
  }
  if (quantity < 20) {
    return { label: 'Low Stock', variant: 'warning', isLow: true, isOut: false };
  }
  return { label: 'In Stock', variant: 'success', isLow: false, isOut: false };
};

/**
 * Get quality grade badge variant
 */
const getQualityGradeVariant = (grade: QualityGrade): 'default' | 'secondary' | 'outline' => {
  switch (grade) {
    case 'OEM':
      return 'default'; // Will use custom emerald/green styling
    case 'Aftermarket':
      return 'outline'; // Will use custom warning styling
    case 'Refurbished':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Get quality grade badge custom className
 */
const getQualityGradeClassName = (grade: QualityGrade): string => {
  switch (grade) {
    case 'OEM':
      return 'bg-success text-success-foreground hover:bg-success/90 border-transparent';
    case 'Aftermarket':
      return 'bg-warning text-warning-foreground hover:bg-warning/90 border-warning';
    case 'Refurbished':
      return 'bg-secondary text-secondary-foreground';
    default:
      return '';
  }
};

// ====================
// Components
// ====================

/**
 * Stock Status Badge Component
 */
function StockStatusBadge({ quantity }: { quantity: number }) {
  const status = getStockStatus(quantity);

  const variantStyles = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-error/10 text-error border-error/20',
  };

  return (
    <Badge
      variant="outline"
      className={cn('text-xs', variantStyles[status.variant])}
    >
      {status.isOut ? (
        <Package className="mr-1 h-3 w-3" />
      ) : status.isLow ? (
        <AlertTriangle className="mr-1 h-3 w-3" />
      ) : (
        <Package className="mr-1 h-3 w-3" />
      )}
      {status.label}
    </Badge>
  );
}

/**
 * Quantity Selector Component
 */
function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  disabled,
  maxQuantity,
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange: (value: number) => void;
  disabled: boolean;
  maxQuantity: number;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= MOQ) {
      onChange(Math.min(value, maxQuantity));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrease}
        disabled={disabled || quantity <= MOQ}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        min={MOQ}
        max={maxQuantity}
        className="h-8 w-14 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrease}
        disabled={disabled || quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

/**
 * Product Card Component
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const [quantity, setQuantity] = React.useState(MOQ);
  const [isAdding, setIsAdding] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const hasItem = useCartStore((state) => state.hasItem);
  const getItem = useCartStore((state) => state.getItem);

  const isInCart = hasItem(product.id);
  const cartItem = getItem(product.id);
  const stockStatus = getStockStatus(product.stockQuantity);
  const isOutOfStock = stockStatus.isOut;

  // Sync quantity with cart if already in cart
  React.useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  const handleIncrease = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > MOQ) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    // Simulate a brief delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 200));
    addItem(product, quantity);
    setIsAdding(false);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        isOutOfStock && 'opacity-75',
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}

        {/* Low Stock Badge Overlay */}
        {stockStatus.isLow && !stockStatus.isOut && (
          <div className="absolute left-2 top-2">
            <Badge className="bg-warning text-warning-foreground border-transparent">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Only {product.stockQuantity} left
            </Badge>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* In Cart Indicator */}
        {isInCart && !isOutOfStock && (
          <div className="absolute right-2 top-2">
            <Badge className="bg-primary text-primary-foreground border-transparent">
              <ShoppingCart className="mr-1 h-3 w-3" />
              In Cart
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* SKU (Caption/Overline) */}
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.sku}
        </p>

        {/* Product Name (H3 Subtitle Style) */}
        <h3 className="font-semibold text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Device Model */}
        <p className="text-sm text-muted-foreground mb-3">
          {product.brand} • {product.deviceModel}
        </p>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Quality Grade Badge */}
          <Badge
            variant={getQualityGradeVariant(product.qualityGrade)}
            className={cn('text-xs', getQualityGradeClassName(product.qualityGrade))}
          >
            {product.qualityGrade}
          </Badge>

          {/* Stock Status Badge */}
          <StockStatusBadge quantity={product.stockQuantity} />

          {/* MOQ Badge */}
          <Badge variant="outline" className="text-xs">
            Min. {MOQ} units
          </Badge>
        </div>

        {/* Price Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              ${product.wholesalePrice.toFixed(2)}
            </span>
            {product.wholesalePrice < product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Wholesale price per unit</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex-col gap-3">
        {/* Quantity Selector */}
        {!isOutOfStock && (
          <QuantitySelector
            quantity={quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onChange={handleQuantityChange}
            disabled={isOutOfStock || isAdding}
            maxQuantity={product.stockQuantity}
          />
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          aria-label={`Add ${quantity} ${product.name} to cart`}
        >
          {isAdding ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Adding...
            </>
          ) : isOutOfStock ? (
            <>
              <Package className="mr-2 h-4 w-4" />
              Out of Stock
            </>
          ) : isInCart ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Update Cart ({cartItem?.quantity})
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Memoized Product Card for performance
 */
export const MemoizedProductCard = React.memo(ProductCard);

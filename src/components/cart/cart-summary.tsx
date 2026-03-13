'use client';

import * as React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

/**
 * Props for the CartSummary component
 */
export interface CartSummaryProps {
  className?: string;
  onCheckout?: () => void;
  isCheckoutLoading?: boolean;
}

/**
 * Cart Summary Component
 * Displays subtotal, shipping estimate, tax estimate, and checkout button
 */
export function CartSummary({
  className,
  onCheckout,
  isCheckoutLoading = false,
}: CartSummaryProps) {
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const closeCart = useUIStore((state) => state.closeCart);

  // Calculate totals
  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();

  // Shipping is calculated at checkout (estimate shown)
  // Free shipping over $200, otherwise $9.99
  const estimatedShipping = subtotal >= 200 ? 0 : 9.99;
  const freeShippingThreshold = 200;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Tax estimate (California sales tax ~8.25%, shown as estimate)
  const estimatedTax = subtotal * 0.0825;
  const estimatedTotal = subtotal + estimatedShipping + estimatedTax;

  // Handle checkout click
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Default behavior: close cart and navigate to checkout
      closeCart();
      // In a real app, this would navigate to checkout page
      // router.push('/checkout');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Separator />

      {/* Subtotal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-foreground">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping Estimate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">
            {estimatedShipping === 0 ? (
              <span className="text-success">FREE</span>
            ) : (
              `$${estimatedShipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Free shipping progress */}
        {amountToFreeShipping > 0 && (
          <div className="rounded-md bg-primary-light/50 px-3 py-2">
            <p className="text-xs text-primary">
              Add ${amountToFreeShipping.toFixed(2)} more for free shipping!
            </p>
          </div>
        )}

        {/* Tax Estimate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Tax (est. 8.25%)
          </span>
          <span className="font-medium text-foreground">
            ${estimatedTax.toFixed(2)}
          </span>
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          ${estimatedTotal.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-white"
        size="lg"
        onClick={handleCheckout}
        disabled={items.length === 0 || isCheckoutLoading}
      >
        {isCheckoutLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Continue Shopping Link */}
      <Button
        variant="ghost"
        className="w-full text-muted-foreground hover:text-foreground"
        onClick={closeCart}
      >
        Continue Shopping
      </Button>

      {/* Tax disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        Tax and shipping calculated at checkout
      </p>
    </div>
  );
}

'use client';

import * as React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';

/**
 * Empty Cart State Component
 * Displays when the shopping cart has no items
 */
export function EmptyCart() {
  const closeCart = useUIStore((state) => state.closeCart);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="bg-primary-light/30 flex h-24 w-24 items-center justify-center rounded-full">
          <ShoppingCart className="text-primary h-12 w-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-muted flex h-8 w-8 items-center justify-center rounded-full">
          <span className="text-muted-foreground text-lg font-bold">0</span>
        </div>
      </div>

      {/* Text Content */}
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Your cart is empty
      </h3>
      <p className="text-muted-foreground mb-6 max-w-[260px] text-sm">
        Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
      </p>

      {/* CTA Button */}
      <Button
        onClick={closeCart}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        Start Shopping
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Helpful tip */}
      <p className="text-muted-foreground mt-6 text-xs">
        Tip: Minimum order quantity is 5 units per product
      </p>
    </div>
  );
}

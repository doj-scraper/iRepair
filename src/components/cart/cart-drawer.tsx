'use client';

import * as React from 'react';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { MemoizedCartItem } from './cart-item';
import { CartSummary } from './cart-summary';
import { EmptyCart } from './empty-cart';
import { MOQ } from '@/lib/validations';
import { cn } from '@/lib/utils';

/**
 * Props for the CartDrawer component
 */
export interface CartDrawerProps {
  className?: string;
  onCheckout?: () => void;
  isCheckoutLoading?: boolean;
}

/**
 * Cart Drawer Component
 * Slide-in drawer from right side showing all cart items
 */
export function CartDrawer({
  className,
  onCheckout,
  isCheckoutLoading = false,
}: CartDrawerProps) {
  const isCartOpen = useUIStore((state) => state.isCartOpen);
  const closeCart = useUIStore((state) => state.closeCart);
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Check for any MOQ warnings (items at minimum quantity)
  const itemsAtMoq = items.filter((item) => item.quantity === MOQ);

  // Check for stock issues
  const itemsWithStockIssues = items.filter(
    (item) => item.quantity > item.product.stockQuantity || item.product.stockQuantity === 0
  );

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className={cn(
          'flex w-full flex-col p-0 sm:max-w-md',
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary h-5 w-5" />
              <SheetTitle className="text-lg">Shopping Cart</SheetTitle>
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>
            <span className="text-lg font-semibold text-foreground">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <SheetDescription className="sr-only">
            Your shopping cart with {items.length} products
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            {/* Warnings */}
            {(itemsAtMoq.length > 0 || itemsWithStockIssues.length > 0) && (
              <div className="space-y-2 border-b px-6 py-3">
                {itemsWithStockIssues.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md bg-error/10 p-2 text-sm text-error">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      {itemsWithStockIssues.length} {itemsWithStockIssues.length === 1 ? 'item has' : 'items have'} stock issues.
                      Please adjust quantities before checkout.
                    </span>
                  </div>
                )}
                {itemsAtMoq.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md bg-warning/10 p-2 text-sm text-warning">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      Minimum order quantity is {MOQ} units. Removing items will clear them from cart.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y">
                {items.map((item) => (
                  <MemoizedCartItem key={item.productId} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Summary */}
            <div className="border-t px-6 py-4">
              <CartSummary
                onCheckout={onCheckout}
                isCheckoutLoading={isCheckoutLoading}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Cart Drawer Trigger Button
 * Use this to open the cart drawer programmatically
 */
export function CartDrawerTrigger({ children }: { children: React.ReactNode }) {
  const openCart = useUIStore((state) => state.openCart);

  return (
    <button onClick={openCart} type="button" className="inline-flex">
      {children}
    </button>
  );
}

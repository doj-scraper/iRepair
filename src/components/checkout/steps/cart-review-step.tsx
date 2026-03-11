'use client';

// ============================================
// CellTech Distributor B2B Portal - Cart Review Step
// Review all items, MOQ warnings, update quantities
// ============================================

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Package,
  ArrowRight,
} from 'lucide-react';
import { useCartStore, selectCartItems } from '@/stores/cart-store';
import { useCheckout } from '../checkout-provider';
import { MOQ } from '@/lib/validations';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ====================
// Component
// ====================

export function CartReviewStep() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const { getTotalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const { nextStep, errors } = useCheckout();
  
  const subtotal = getTotalPrice();
  const hasItems = items.length > 0;
  
  // Check for MOQ violations
  const moqViolations = items.filter(item => item.quantity < MOQ);
  const hasMoqViolations = moqViolations.length > 0;
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < MOQ) {
      // Remove item if quantity goes below MOQ
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const handleContinue = () => {
    if (hasItems && !hasMoqViolations) {
      nextStep();
    }
  };
  
  if (!hasItems) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart to continue with checkout.
          </p>
          <Button asChild>
            <Link href="/">
              Browse Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* MOQ Warning */}
      {hasMoqViolations && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some items have quantities below the minimum order quantity of {MOQ} units.
            Please update quantities or remove items to continue.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error message */}
      {errors.cart && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.cart}</AlertDescription>
        </Alert>
      )}
      
      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart Items ({items.length} {items.length === 1 ? 'product' : 'products'})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((item) => {
              const isBelowMoq = item.quantity < MOQ;
              const itemTotal = item.product.wholesalePrice * item.quantity;
              
              return (
                <div 
                  key={item.productId} 
                  className={cn(
                    'p-4 sm:p-6 flex flex-col sm:flex-row gap-4',
                    isBelowMoq && 'bg-destructive/5'
                  )}
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 absolute inset-0 m-auto text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {item.product.sku}
                        </p>
                        <h3 className="font-medium text-base line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product.brand} • {item.product.deviceModel}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {item.product.qualityGrade}
                        </Badge>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right sm:text-right">
                        <p className="font-semibold text-lg text-primary">
                          {formatCurrency(itemTotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.wholesalePrice)} each
                        </p>
                      </div>
                    </div>
                    
                    {/* Quantity Controls & Actions */}
                    <div className="flex items-center justify-between mt-4 gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Qty:</span>
                        <div className="flex items-center border rounded-md">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - MOQ)}
                            disabled={item.quantity <= MOQ}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + MOQ)}
                            disabled={item.quantity >= item.product.stockQuantity}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* MOQ Warning */}
                        {isBelowMoq && (
                          <Badge variant="destructive" className="text-xs">
                            Min: {MOQ}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    {/* Stock Warning */}
                    {item.quantity >= item.product.stockQuantity && (
                      <p className="text-xs text-warning mt-2">
                        Maximum available quantity reached ({item.product.stockQuantity} units)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        
        {/* Cart Summary */}
        <CardFooter className="flex flex-col gap-4 bg-muted/30">
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping & taxes calculated at checkout</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="w-full flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(subtotal)}</span>
          </div>
          
          {/* MOQ Info */}
          <p className="text-xs text-muted-foreground text-center w-full">
            Minimum order quantity: {MOQ} units per product
          </p>
        </CardFooter>
      </Card>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" asChild>
          <Link href="/">
            Continue Shopping
          </Link>
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={hasMoqViolations}
          className="gap-2"
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

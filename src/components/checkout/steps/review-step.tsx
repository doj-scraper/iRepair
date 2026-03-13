'use client';

// ============================================
// CellTech Distributor B2B Portal - Review Step
// Order summary, edit buttons for each section
// Terms acceptance, place order button
// ============================================

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Truck, 
  CreditCard,
  User,
  Mail,
  Phone,
  Building,
  Package,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useCheckout, CHECKOUT_STEPS } from '../checkout-provider';
import { useCartStore, selectCartItems } from '@/stores/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ====================
// Types
// ====================

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}

// ====================
// Review Section Component
// ====================

function ReviewSection({ title, icon, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        {children}
      </div>
    </div>
  );
}

// ====================
// Main Component
// ====================

export function ReviewStep() {
  const { 
    formData, 
    selectedShippingMethod,
    goToStep,
    submitOrder,
    prevStep,
    errors,
    isSubmitting,
  } = useCheckout();
  
  const items = useCartStore(selectCartItems);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [orderNotes, setOrderNotes] = useState(formData.notes || '');
  
  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = selectedShippingMethod?.price || 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  const canSubmit = acceptedTerms && !isSubmitting;
  
  const handleSubmit = async () => {
    if (canSubmit) {
      await submitOrder();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Error message */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}
      
      {/* Main Review Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Review Your Order
          </CardTitle>
          <CardDescription>
            Please review your order details before placing your order.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Contact Info */}
          <ReviewSection
            title="Contact Information"
            icon={<User className="w-4 h-4" />}
            onEdit={() => goToStep('contact')}
          >
            <div className="space-y-1">
              <p className="font-medium">{formData.name}</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {formData.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {formData.phone}
              </p>
              {formData.companyName && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Building className="w-4 h-4" />
                  {formData.companyName}
                </p>
              )}
            </div>
          </ReviewSection>
          
          {/* Shipping Address */}
          <ReviewSection
            title="Shipping Address"
            icon={<MapPin className="w-4 h-4" />}
            onEdit={() => goToStep('shipping-address')}
          >
            <div className="space-y-1">
              <p className="font-medium">{formData.shippingAddress.recipientName}</p>
              <p>{formData.shippingAddress.street}</p>
              <p>
                {formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}
              </p>
              <p>{formData.shippingAddress.country}</p>
              {formData.shippingAddress.phone && (
                <p className="text-muted-foreground">{formData.shippingAddress.phone}</p>
              )}
            </div>
          </ReviewSection>
          
          {/* Shipping Method */}
          <ReviewSection
            title="Shipping Method"
            icon={<Truck className="w-4 h-4" />}
            onEdit={() => goToStep('shipping-method')}
          >
            {selectedShippingMethod ? (
              <div className="space-y-1">
                <p className="font-medium">{selectedShippingMethod.name}</p>
                <p className="text-muted-foreground">{selectedShippingMethod.description}</p>
                <p className="text-muted-foreground">
                  Estimated delivery: {selectedShippingMethod.estimatedDays}
                </p>
                <p className="font-medium mt-2">
                  {selectedShippingMethod.price === 0 ? 'FREE' : formatCurrency(selectedShippingMethod.price)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No shipping method selected</p>
            )}
          </ReviewSection>
          
          {/* Payment Method */}
          <ReviewSection
            title="Payment Method"
            icon={<CreditCard className="w-4 h-4" />}
            onEdit={() => goToStep('payment')}
          >
            <p className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span>Credit Card ending in •••• 4242</span>
            </p>
          </ReviewSection>
          
          <Separator />
          
          {/* Order Items */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Items ({items.length} {items.length === 1 ? 'product' : 'products'})
            </h4>
            
            <div className="bg-muted/50 rounded-lg divide-y max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="p-3 flex items-center gap-3">
                  {/* Product Image */}
                  <div className="relative w-12 h-12 bg-background rounded overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 absolute inset-0 m-auto text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.sku} • Qty: {item.quantity}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <p className="font-medium text-sm">
                    {formatCurrency(item.product.wholesalePrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => goToStep('cart')}>
              <Edit className="w-4 h-4 mr-1" />
              Edit Cart
            </Button>
          </div>
          
          <Separator />
          
          {/* Order Notes */}
          <div className="space-y-2">
            <Label htmlFor="orderNotes">Order Notes (optional)</Label>
            <Textarea
              id="orderNotes"
              placeholder="Any special instructions for your order..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Terms & Submit */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I agree to the{' '}
              <Button variant="link" className="h-auto p-0 text-primary" asChild>
                <a href="/terms" target="_blank">Terms of Service</a>
              </Button>
              {' '}and{' '}
              <Button variant="link" className="h-auto p-0 text-primary" asChild>
                <a href="/privacy" target="_blank">Privacy Policy</a>
              </Button>
              . I understand that my order is subject to the CellTech Distributor policies.
            </Label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payment
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order • {formatCurrency(total)}
                </>
              )}
            </Button>
          </div>
          
          {!acceptedTerms && (
            <p className="text-sm text-muted-foreground text-center">
              Please accept the terms and conditions to place your order.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

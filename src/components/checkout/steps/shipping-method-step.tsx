'use client';

// ============================================
// CellTech Distributor B2B Portal - Shipping Method Step
// Shipping options with flat rates, delivery estimates, cost display
// ============================================

import React, { useMemo } from 'react';
import { Truck, ArrowLeft, ArrowRight, Clock, Package, Zap, Star } from 'lucide-react';
import { useCheckout, SHIPPING_METHODS } from '../checkout-provider';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ====================
// Component
// ====================

export function ShippingMethodStep() {
  const { 
    selectedShippingMethod, 
    selectShippingMethod, 
    nextStep, 
    prevStep, 
    errors,
    validateCurrentStep 
  } = useCheckout();
  
  const getTotalPrice = useCartStore(state => state.getTotalPrice);
  const subtotal = getTotalPrice();
  
  // Check if free shipping is available
  const isFreeShippingAvailable = subtotal >= 200;
  
  // Filter shipping methods based on order total
  const availableMethods = useMemo(() => {
    return SHIPPING_METHODS.filter(method => {
      // Only show free shipping if order is over $200
      if (method.id === 'free') {
        return isFreeShippingAvailable;
      }
      return true;
    });
  }, [isFreeShippingAvailable]);
  
  const handleContinue = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Method
        </CardTitle>
        <CardDescription>
          Select your preferred shipping method for delivery.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Free Shipping Notice */}
        {!isFreeShippingAvailable && (
          <Alert>
            <Star className="h-4 w-4" />
            <AlertDescription>
              Add <strong>{formatCurrency(200 - subtotal)}</strong> more to qualify for FREE standard shipping!
            </AlertDescription>
          </Alert>
        )}
        
        {/* Shipping Options */}
        <RadioGroup
          value={selectedShippingMethod?.id || ''}
          onValueChange={(value) => {
            const method = SHIPPING_METHODS.find(m => m.id === value);
            if (method) selectShippingMethod(method);
          }}
          className="space-y-3"
        >
          {availableMethods.map((method) => {
            const isSelected = selectedShippingMethod?.id === method.id;
            const isFree = method.price === 0;
            
            return (
              <Label
                key={method.id}
                htmlFor={method.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                )}
              >
                <RadioGroupItem 
                  value={method.id} 
                  id={method.id} 
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Method Icon */}
                      {method.id === 'standard' && <Package className="w-5 h-5 text-muted-foreground" />}
                      {method.id === 'express' && <Zap className="w-5 h-5 text-warning" />}
                      {method.id === 'overnight' && <Truck className="w-5 h-5 text-primary" />}
                      {method.id === 'free' && <Star className="w-5 h-5 text-success" />}
                      
                      <span className="font-medium">{method.name}</span>
                      
                      {isFree && (
                        <Badge className="bg-success text-success-foreground">
                          FREE
                        </Badge>
                      )}
                    </div>
                    
                    <span className={cn(
                      'font-semibold text-lg',
                      isFree ? 'text-success' : 'text-foreground'
                    )}>
                      {isFree ? 'FREE' : formatCurrency(method.price)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {method.description}
                  </p>
                  
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Estimated delivery: {method.estimatedDays}</span>
                  </div>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
        
        {/* Error message */}
        {errors.shippingMethod && (
          <p className="text-sm text-destructive">{errors.shippingMethod}</p>
        )}
        
        <Separator />
        
        {/* Shipping Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">Shipping Information</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Orders placed before 2 PM EST ship the same business day</span>
            </li>
            <li className="flex items-start gap-2">
              <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Tracking information will be sent to your email once shipped</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Business days are Monday through Friday, excluding holidays</span>
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Address
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!selectedShippingMethod}
        >
          Continue to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

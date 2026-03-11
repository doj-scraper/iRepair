'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Mail, 
  User,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfirmationStepProps {
  orderNumber: string;
  email: string;
  estimatedDelivery: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  isGuest: boolean;
  onCreateAccount?: () => void;
}

export function ConfirmationStep({
  orderNumber,
  email,
  estimatedDelivery,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  isGuest,
  onCreateAccount,
}: ConfirmationStepProps) {
  const [copied, setCopied] = useState(false);
  const [accountCreating, setAccountCreating] = useState(false);

  const copyOrderNumber = async () => {
    await navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAccount = () => {
    setAccountCreating(true);
    onCreateAccount?.();
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Order Confirmed!</h2>
        <p className="text-muted-foreground mt-2">
          Thank you for your order. We&apos;ve sent a confirmation email to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* Order Number */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold text-foreground font-mono">{orderNumber}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyOrderNumber}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Estimate */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="font-medium text-foreground">Estimated Delivery</p>
          <p className="text-sm text-muted-foreground">{estimatedDelivery}</p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {item.sku} · Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{shippingAddress.name}</p>
              <p className="text-muted-foreground">{shippingAddress.street}</p>
              <p className="text-muted-foreground">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Order Processing</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll prepare your order for shipment within 1-2 business days.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Shipping Notification</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive an email with tracking information once your order ships.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Your parts will arrive by {estimatedDelivery}.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Account Prompt for Guests */}
      {isGuest && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Create an Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Save your details for faster future checkout, track your orders, and access 
                  exclusive wholesale pricing.
                </p>
                <Button
                  onClick={handleCreateAccount}
                  className="mt-4 gap-2"
                  disabled={accountCreating}
                >
                  {accountCreating ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Shopping */}
      <div className="text-center pt-4">
        <Button variant="outline" asChild>
          <a href="/">
            Continue Shopping
          </a>
        </Button>
      </div>
    </div>
  );
}

export default ConfirmationStep;

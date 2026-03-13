'use client';

// ============================================
// CellTech Distributor B2B Portal - Payment Step
// Mock Stripe Elements integration with card input
// Apple Pay / Google Pay buttons (disabled state)
// ============================================

import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Shield, 
  AlertCircle,
  Apple,
  Wallet,
} from 'lucide-react';
import { useCheckout } from '../checkout-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ====================
// Types
// ====================

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// ====================
// Mock Card Input Component
// ====================

function MockCardInput({ 
  value, 
  onChange, 
  errors 
}: { 
  value: CardDetails;
  onChange: (field: keyof CardDetails, val: string) => void;
  errors: Record<string, string>;
}) {
  const formatCardNumber = (num: string) => {
    // Remove non-digits
    const digits = num.replace(/\D/g, '');
    // Format with spaces
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };
  
  const formatExpiry = (exp: string) => {
    // Remove non-digits
    const digits = exp.replace(/\D/g, '');
    // Format MM/YY
    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    return digits;
  };
  
  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="flex items-center gap-1">
          <CreditCard className="w-4 h-4" />
          Card Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cardNumber"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={value.number}
          onChange={(e) => onChange('number', formatCardNumber(e.target.value))}
          maxLength={19}
          className={cn(errors.number && 'border-destructive')}
          aria-invalid={!!errors.number}
        />
        {errors.number && (
          <p className="text-sm text-destructive">{errors.number}</p>
        )}
      </div>
      
      {/* Cardholder Name */}
      <div className="space-y-2">
        <Label htmlFor="cardName">
          Cardholder Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cardName"
          type="text"
          placeholder="John Doe"
          value={value.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={cn(errors.name && 'border-destructive')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>
      
      {/* Expiry & CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">
            Expiry <span className="text-destructive">*</span>
          </Label>
          <Input
            id="expiry"
            type="text"
            placeholder="MM/YY"
            value={value.expiry}
            onChange={(e) => onChange('expiry', formatExpiry(e.target.value))}
            maxLength={5}
            className={cn(errors.expiry && 'border-destructive')}
            aria-invalid={!!errors.expiry}
          />
          {errors.expiry && (
            <p className="text-sm text-destructive">{errors.expiry}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cvc">
            CVC <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cvc"
            type="text"
            placeholder="123"
            value={value.cvc}
            onChange={(e) => onChange('cvc', e.target.value.replace(/\D/g, '').substring(0, 4))}
            maxLength={4}
            className={cn(errors.cvc && 'border-destructive')}
            aria-invalid={!!errors.cvc}
          />
          {errors.cvc && (
            <p className="text-sm text-destructive">{errors.cvc}</p>
          )}
        </div>
      </div>
      
      {/* Card Brands */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="text-xs text-muted-foreground border rounded px-2 py-1 font-medium">VISA</div>
        <div className="text-xs text-muted-foreground border rounded px-2 py-1 font-medium">MC</div>
        <div className="text-xs text-muted-foreground border rounded px-2 py-1 font-medium">AMEX</div>
        <div className="text-xs text-muted-foreground border rounded px-2 py-1 font-medium">DISC</div>
      </div>
    </div>
  );
}

// ====================
// Main Component
// ====================

export function PaymentStep() {
  const { nextStep, prevStep, errors } = useCheckout();
  
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'googlepay'>('card');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const handleCardChange = (field: keyof CardDetails, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error when user types
    if (localErrors[field]) {
      setLocalErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };
  
  const validateCard = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 15) {
      newErrors.number = 'Enter a valid card number';
    }
    if (!cardDetails.name) {
      newErrors.name = 'Cardholder name is required';
    }
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      newErrors.expiry = 'Enter a valid expiry date';
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = 'Enter a valid CVC';
    }
    
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    if (paymentMethod === 'card' && validateCard()) {
      nextStep();
    } else if (paymentMethod !== 'card') {
      // For Apple Pay / Google Pay, just proceed
      nextStep();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </CardTitle>
        <CardDescription>
          Choose your payment method. All transactions are secure and encrypted.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security Notice */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <span>Your payment information is secured with 256-bit SSL encryption.</span>
            <Shield className="w-4 h-4 text-success" />
          </AlertDescription>
        </Alert>
        
        {/* Payment Method Tabs */}
        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Card</span>
            </TabsTrigger>
            <TabsTrigger value="applepay" className="gap-2" disabled>
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Apple Pay</span>
              <Badge variant="outline" className="text-xs ml-1">Soon</Badge>
            </TabsTrigger>
            <TabsTrigger value="googlepay" className="gap-2" disabled>
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Google Pay</span>
              <Badge variant="outline" className="text-xs ml-1">Soon</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="mt-6">
            <MockCardInput 
              value={cardDetails}
              onChange={handleCardChange}
              errors={localErrors}
            />
          </TabsContent>
          
          <TabsContent value="applepay" className="mt-6">
            <div className="text-center py-8 space-y-4">
              <Apple className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Apple Pay integration coming soon.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="googlepay" className="mt-6">
            <div className="text-center py-8 space-y-4">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Google Pay integration coming soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator />
        
        {/* Payment Security Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            Secure Payment
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Your card details are encrypted and never stored on our servers</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>We use Stripe for PCI-compliant payment processing</span>
            </li>
          </ul>
        </div>
        
        {/* Error message */}
        {errors.payment && (
          <p className="text-sm text-destructive">{errors.payment}</p>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shipping
        </Button>
        <Button onClick={handleContinue}>
          Review Order
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

// ============================================
// CellTech Distributor B2B Portal - Shipping Address Step
// Address form, saved addresses for logged-in users
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Building, 
  Plus,
  Check,
} from 'lucide-react';
import { useCheckout } from '../checkout-provider';
import type { AddressFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ====================
// Types
// ====================

interface SavedAddressCardProps {
  address: {
    id: string;
    label: string;
    recipientName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string | null;
    isDefault?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

// ====================
// Constants
// ====================

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const COUNTRIES = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Mexico', label: 'Mexico' },
];

// ====================
// Saved Address Card Component
// ====================

function SavedAddressCard({ address, isSelected, onSelect }: SavedAddressCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all',
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-muted hover:border-primary/50'
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{address.recipientName}</span>
            {address.isDefault && (
              <Badge variant="outline" className="text-xs">Default</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {address.street}
          </p>
          <p className="text-sm text-muted-foreground">
            {address.city}, {address.state} {address.zipCode}
          </p>
          <p className="text-sm text-muted-foreground">
            {address.country}
          </p>
          {address.phone && (
            <p className="text-sm text-muted-foreground mt-1">
              {address.phone}
            </p>
          )}
        </div>
        <div className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
        )}>
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </button>
  );
}

// ====================
// Main Component
// ====================

export function ShippingAddressStep() {
  const { 
    formData, 
    setShippingAddress, 
    nextStep, 
    prevStep, 
    errors, 
    isLoggedIn,
    savedAddresses,
    applySavedAddress,
    validateCurrentStep 
  } = useCheckout();
  
  const [useSaved, setUseSaved] = useState(savedAddresses.length > 0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find(a => a.isDefault)?.id || null
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Validate on touch - compute errors directly instead of in effect
  const localErrors = React.useMemo(() => {
    if (useSaved) return {};
    const newErrors: Record<string, string> = {};
    const addr = formData.shippingAddress;
    
    if (touched.recipientName && !addr.recipientName) {
      newErrors.recipientName = 'Recipient name is required';
    }
    if (touched.street && !addr.street) {
      newErrors.street = 'Street address is required';
    }
    if (touched.city && !addr.city) {
      newErrors.city = 'City is required';
    }
    if (touched.state && !addr.state) {
      newErrors.state = 'State is required';
    }
    if (touched.zipCode && !addr.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    return newErrors;
  }, [formData.shippingAddress, touched, useSaved]);
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  const handleAddressChange = (field: keyof AddressFormData, value: string) => {
    setShippingAddress({
      ...formData.shippingAddress,
      [field]: value,
    });
  };
  
  const handleSavedAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      applySavedAddress(address);
    }
  };
  
  const handleContinue = () => {
    if (useSaved && selectedAddressId) {
      const address = savedAddresses.find(a => a.id === selectedAddressId);
      if (address) {
        applySavedAddress(address);
        nextStep();
        return;
      }
    }
    
    // Mark all fields as touched
    setTouched({
      recipientName: true,
      street: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      phone: true,
    });
    
    if (validateCurrentStep()) {
      nextStep();
    }
  };
  
  const getFieldError = (field: string): string | undefined => {
    return localErrors[field] || errors[field];
  };
  
  const hasError = (field: string): boolean => {
    return touched[field] && !!getFieldError(field);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Shipping Address
        </CardTitle>
        <CardDescription>
          Enter the address where you&apos;d like your order delivered.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Saved Addresses Toggle */}
        {isLoggedIn && savedAddresses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={useSaved ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseSaved(true)}
              >
                Saved Addresses
              </Button>
              <Button
                type="button"
                variant={!useSaved ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseSaved(false)}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Address
              </Button>
            </div>
            
            {useSaved && (
              <div className="space-y-3">
                {savedAddresses.map((address) => (
                  <SavedAddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddressId === address.id}
                    onSelect={() => handleSavedAddressSelect(address.id)}
                  />
                ))}
              </div>
            )}
            
            <Separator />
          </div>
        )}
        
        {/* New Address Form */}
        {(!isLoggedIn || !useSaved || savedAddresses.length === 0) && (
          <div className="space-y-6">
            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="recipientName" className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Recipient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipientName"
                type="text"
                placeholder="John Doe"
                value={formData.shippingAddress.recipientName}
                onChange={(e) => handleAddressChange('recipientName', e.target.value)}
                onBlur={() => handleBlur('recipientName')}
                className={cn(hasError('recipientName') && 'border-destructive')}
                aria-invalid={hasError('recipientName')}
              />
              {hasError('recipientName') && (
                <p className="text-sm text-destructive">{getFieldError('recipientName')}</p>
              )}
            </div>
            
            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="street" className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                Street Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                type="text"
                placeholder="123 Main Street"
                value={formData.shippingAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                onBlur={() => handleBlur('street')}
                className={cn(hasError('street') && 'border-destructive')}
                aria-invalid={hasError('street')}
              />
              {hasError('street') && (
                <p className="text-sm text-destructive">{getFieldError('street')}</p>
              )}
            </div>
            
            {/* City, State, ZIP */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Los Angeles"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  className={cn(hasError('city') && 'border-destructive')}
                  aria-invalid={hasError('city')}
                />
                {hasError('city') && (
                  <p className="text-sm text-destructive">{getFieldError('city')}</p>
                )}
              </div>
              
              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.shippingAddress.state}
                  onValueChange={(value) => handleAddressChange('state', value)}
                >
                  <SelectTrigger 
                    id="state"
                    className={cn(hasError('state') && 'border-destructive')}
                  >
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasError('state') && (
                  <p className="text-sm text-destructive">{getFieldError('state')}</p>
                )}
              </div>
              
              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode">
                  ZIP Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="90210"
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  onBlur={() => handleBlur('zipCode')}
                  className={cn(hasError('zipCode') && 'border-destructive')}
                  aria-invalid={hasError('zipCode')}
                />
                {hasError('zipCode') && (
                  <p className="text-sm text-destructive">{getFieldError('zipCode')}</p>
                )}
              </div>
            </div>
            
            {/* Country */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.shippingAddress.country}
                  onValueChange={(value) => handleAddressChange('country', value)}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Phone (optional) */}
              <div className="space-y-2">
                <Label htmlFor="addressPhone">Phone (optional)</Label>
                <Input
                  id="addressPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.shippingAddress.phone || ''}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contact
        </Button>
        <Button onClick={handleContinue}>
          Continue to Shipping Method
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

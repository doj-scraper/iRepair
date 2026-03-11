'use client';

// ============================================
// CellTech Distributor B2B Portal - Contact Step
// Name, email, phone fields with validation
// Guest vs logged-in handling
// ============================================

import React, { useState, useMemo } from 'react';
import { User, Mail, Phone, Building, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCheckout } from '../checkout-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ====================
// Component
// ====================

export function ContactStep() {
  const { 
    formData, 
    updateFormData, 
    nextStep, 
    prevStep, 
    errors, 
    isLoggedIn,
    validateCurrentStep 
  } = useCheckout();
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Calculate local errors based on touched fields
  const localErrors = useMemo(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.email && !formData.email) {
      newErrors.email = 'Email is required';
    } else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (touched.name && !formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (touched.phone && !formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (touched.phone && formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    return newErrors;
  }, [formData, touched]);
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  const handleChange = (field: keyof typeof formData, value: string) => {
    updateFormData({ [field]: value });
  };
  
  const handleContinue = () => {
    // Mark all fields as touched
    setTouched({
      email: true,
      name: true,
      phone: true,
      companyName: true,
      taxId: true,
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
          <User className="w-5 h-5" />
          Contact Information
        </CardTitle>
        <CardDescription>
          {isLoggedIn 
            ? 'Your saved contact information will be used for this order.'
            : 'Enter your contact details to proceed with checkout.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Login status badge */}
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary">
              Logged In
            </Badge>
            <span className="text-sm text-muted-foreground">
              Your information has been pre-filled
            </span>
          </div>
        )}
        
        {/* Guest notice */}
        {!isLoggedIn && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              You&apos;re checking out as a guest. You can create an account after placing your order.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Contact Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Email */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={cn(hasError('email') && 'border-destructive')}
              disabled={isLoggedIn}
              aria-invalid={hasError('email')}
              aria-describedby={hasError('email') ? 'email-error' : undefined}
            />
            {hasError('email') && (
              <p id="email-error" className="text-sm text-destructive">
                {getFieldError('email')}
              </p>
            )}
          </div>
          
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={cn(hasError('name') && 'border-destructive')}
              disabled={isLoggedIn}
              aria-invalid={hasError('name')}
              aria-describedby={hasError('name') ? 'name-error' : undefined}
            />
            {hasError('name') && (
              <p id="name-error" className="text-sm text-destructive">
                {getFieldError('name')}
              </p>
            )}
          </div>
          
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              className={cn(hasError('phone') && 'border-destructive')}
              disabled={isLoggedIn}
              aria-invalid={hasError('phone')}
              aria-describedby={hasError('phone') ? 'phone-error' : undefined}
            />
            {hasError('phone') && (
              <p id="phone-error" className="text-sm text-destructive">
                {getFieldError('phone')}
              </p>
            )}
          </div>
        </div>
        
        {/* Separator */}
        <Separator />
        
        {/* Optional Company Info */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Business information (optional)
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Your Company Inc."
                value={formData.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                disabled={isLoggedIn}
              />
            </div>
            
            {/* Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="taxId" className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Tax ID / EIN
              </Label>
              <Input
                id="taxId"
                type="text"
                placeholder="XX-XXXXXXX"
                value={formData.taxId || ''}
                onChange={(e) => handleChange('taxId', e.target.value)}
                disabled={isLoggedIn}
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>
        <Button onClick={handleContinue}>
          Continue to Shipping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

// ============================================
// CellTech Distributor B2B Portal - Checkout Provider
// Context provider for checkout state management
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CheckoutFormData, AddressFormData, Address } from '@/types';
import { checkoutSchema } from '@/lib/validations';
import { useCartStore } from '@/stores/cart-store';
import type { ZodError } from 'zod';

// ====================
// Types
// ====================

export type CheckoutStep = 
  | 'cart'
  | 'contact'
  | 'shipping-address'
  | 'shipping-method'
  | 'payment'
  | 'review'
  | 'confirmation';

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface OrderResult {
  orderNumber: string;
  email: string;
  estimatedDelivery: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  formData: CheckoutFormData;
  selectedShippingMethod: ShippingMethod | null;
  orderResult: OrderResult | null;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  savedAddresses: Address[];
}

export interface CheckoutContextValue extends CheckoutState {
  // Step navigation
  goToStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Form data management
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  setShippingAddress: (address: AddressFormData) => void;
  setBillingAddress: (address: AddressFormData | undefined) => void;
  setBillingSameAsShipping: (same: boolean) => void;
  
  // Shipping method
  selectShippingMethod: (method: ShippingMethod) => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  validateStep: (step: CheckoutStep) => boolean;
  
  // Submission
  submitOrder: () => Promise<void>;
  
  // Address management
  setSavedAddresses: (addresses: Address[]) => void;
  applySavedAddress: (address: Address) => void;
  
  // Reset
  resetCheckout: () => void;
  
  // Helpers
  getStepIndex: (step: CheckoutStep) => number;
  isStepComplete: (step: CheckoutStep) => boolean;
}

// ====================
// Constants
// ====================

export const CHECKOUT_STEPS: { id: CheckoutStep; label: string; description: string }[] = [
  { id: 'cart', label: 'Cart', description: 'Review items' },
  { id: 'contact', label: 'Contact', description: 'Your info' },
  { id: 'shipping-address', label: 'Shipping', description: 'Delivery address' },
  { id: 'shipping-method', label: 'Method', description: 'Delivery options' },
  { id: 'payment', label: 'Payment', description: 'Secure payment' },
  { id: 'review', label: 'Review', description: 'Confirm order' },
  { id: 'confirmation', label: 'Complete', description: 'Order confirmed' },
];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivered in 5-7 business days',
    price: 9.99,
    estimatedDays: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivered in 2-3 business days',
    price: 19.99,
    estimatedDays: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    price: 39.99,
    estimatedDays: 'Next business day',
  },
  {
    id: 'free',
    name: 'Free Shipping',
    description: 'Orders over $200 - Standard delivery',
    price: 0,
    estimatedDays: '5-7 business days',
  },
];

// Default form data
const defaultFormData: CheckoutFormData = {
  email: '',
  name: '',
  phone: '',
  companyName: '',
  taxId: '',
  shippingAddress: {
    recipientName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  },
  billingSameAsShipping: true,
  billingAddress: undefined,
  notes: '',
  createAccount: false,
  password: '',
};

// ====================
// Context
// ====================

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

// ====================
// Provider Component
// ====================

export function CheckoutProvider({
  children,
  isLoggedIn = false,
  initialData,
  savedAddresses = [],
}: {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  initialData?: Partial<CheckoutFormData>;
  savedAddresses?: Address[];
}) {
  const { items, clearCart, getTotalPrice } = useCartStore();
  
  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [formData, setFormData] = useState<CheckoutFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSavedAddresses, setUserSavedAddresses] = useState<Address[]>(savedAddresses);
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set());
  
  // Step navigation
  const getStepIndex = useCallback((step: CheckoutStep) => {
    return CHECKOUT_STEPS.findIndex(s => s.id === step);
  }, []);
  
  const goToStep = useCallback((step: CheckoutStep) => {
    const currentIndex = getStepIndex(currentStep);
    const targetIndex = getStepIndex(step);
    
    // Can go back to any previous step
    // Can only go forward if current step is valid
    if (targetIndex <= currentIndex || completedSteps.has(currentStep) || step === 'cart') {
      setCurrentStep(step);
    }
  }, [currentStep, completedSteps, getStepIndex]);
  
  const nextStep = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < CHECKOUT_STEPS.length - 1) {
      const nextStepId = CHECKOUT_STEPS[currentIndex + 1].id;
      // Mark current step as complete
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(nextStepId);
    }
  }, [currentStep, getStepIndex]);
  
  const prevStep = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(CHECKOUT_STEPS[currentIndex - 1].id);
    }
  }, [currentStep, getStepIndex]);
  
  const canGoNext = useMemo(() => {
    const currentIndex = getStepIndex(currentStep);
    return currentIndex < CHECKOUT_STEPS.length - 1;
  }, [currentStep, getStepIndex]);
  
  const canGoPrev = useMemo(() => {
    const currentIndex = getStepIndex(currentStep);
    return currentIndex > 0 && currentStep !== 'confirmation';
  }, [currentStep, getStepIndex]);
  
  // Form data management
  const updateFormData = useCallback((data: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setErrors({});
  }, []);
  
  const setShippingAddress = useCallback((address: AddressFormData) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: address,
    }));
    setErrors({});
  }, []);
  
  const setBillingAddress = useCallback((address: AddressFormData | undefined) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: address,
    }));
    setErrors({});
  }, []);
  
  const setBillingSameAsShipping = useCallback((same: boolean) => {
    setFormData(prev => ({
      ...prev,
      billingSameAsShipping: same,
      billingAddress: same ? undefined : prev.billingAddress,
    }));
  }, []);
  
  // Shipping method
  const selectShippingMethod = useCallback((method: ShippingMethod) => {
    setSelectedShippingMethod(method);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.shippingMethod;
      return newErrors;
    });
  }, []);
  
  // Validation
  const validateStep = useCallback((step: CheckoutStep): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'cart':
        if (items.length === 0) {
          newErrors.cart = 'Your cart is empty';
        }
        break;
        
      case 'contact':
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email address';
        }
        if (!formData.name) {
          newErrors.name = 'Name is required';
        }
        if (!formData.phone) {
          newErrors.phone = 'Phone is required';
        } else if (!/^[\d\s\-+()]+$/.test(formData.phone)) {
          newErrors.phone = 'Invalid phone number';
        }
        break;
        
      case 'shipping-address':
        if (!formData.shippingAddress.recipientName) {
          newErrors.recipientName = 'Recipient name is required';
        }
        if (!formData.shippingAddress.street) {
          newErrors.street = 'Street address is required';
        }
        if (!formData.shippingAddress.city) {
          newErrors.city = 'City is required';
        }
        if (!formData.shippingAddress.state) {
          newErrors.state = 'State is required';
        }
        if (!formData.shippingAddress.zipCode) {
          newErrors.zipCode = 'ZIP code is required';
        }
        if (!formData.shippingAddress.country) {
          newErrors.country = 'Country is required';
        }
        break;
        
      case 'shipping-method':
        if (!selectedShippingMethod) {
          newErrors.shippingMethod = 'Please select a shipping method';
        }
        break;
        
      case 'payment':
        // Payment validation is handled within the payment step
        break;
        
      case 'review':
        // Validate all data before submission
        try {
          checkoutSchema.parse(formData);
        } catch (error) {
          const zodError = error as ZodError;
          zodError.errors.forEach(err => {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          });
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [items.length, formData, selectedShippingMethod]);
  
  const validateCurrentStep = useCallback(() => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);
  
  // Submission
  const submitOrder = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate all data
      if (!validateStep('review')) {
        throw new Error('Please complete all required fields');
      }
      
      if (!selectedShippingMethod) {
        throw new Error('Please select a shipping method');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order result
      const subtotal = getTotalPrice();
      const shipping = selectedShippingMethod.price;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + shipping + tax;
      
      const result: OrderResult = {
        orderNumber: `CT-${Date.now().toString(36).toUpperCase()}`,
        email: formData.email,
        estimatedDelivery: selectedShippingMethod.estimatedDays,
        subtotal,
        shipping,
        tax,
        total,
      };
      
      setOrderResult(result);
      setCompletedSteps(prev => new Set(prev).add('review'));
      setCurrentStep('confirmation');
      
      // Clear cart after successful order
      clearCart();
      
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred processing your order',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateStep, selectedShippingMethod, getTotalPrice, formData.email, clearCart]);
  
  // Address management
  const setSavedAddresses = useCallback((addresses: Address[]) => {
    setUserSavedAddresses(addresses);
  }, []);
  
  const applySavedAddress = useCallback((address: Address) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        recipientName: address.recipientName,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || '',
      },
    }));
  }, []);
  
  // Reset
  const resetCheckout = useCallback(() => {
    setCurrentStep('cart');
    setFormData(defaultFormData);
    setSelectedShippingMethod(null);
    setOrderResult(null);
    setErrors({});
    setIsSubmitting(false);
    setCompletedSteps(new Set());
  }, []);
  
  // Check if step is complete
  const isStepComplete = useCallback((step: CheckoutStep) => {
    return completedSteps.has(step);
  }, [completedSteps]);
  
  // Context value
  const value: CheckoutContextValue = {
    currentStep,
    formData,
    selectedShippingMethod,
    orderResult,
    errors,
    isSubmitting,
    isLoggedIn,
    savedAddresses: userSavedAddresses,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    updateFormData,
    setShippingAddress,
    setBillingAddress,
    setBillingSameAsShipping,
    selectShippingMethod,
    validateCurrentStep,
    validateStep,
    submitOrder,
    setSavedAddresses,
    applySavedAddress,
    resetCheckout,
    getStepIndex,
    isStepComplete,
  };
  
  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

// ====================
// Hook
// ====================

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}

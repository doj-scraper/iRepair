'use client';

// ============================================
// CellTech Distributor B2B Portal - Checkout Steps
// Step indicator component with progress visualization
// ============================================

import React from 'react';
import { Check } from 'lucide-react';
import { useCheckout, CHECKOUT_STEPS, type CheckoutStep } from './checkout-provider';
import { cn } from '@/lib/utils';

// ====================
// Types
// ====================

export interface CheckoutStepsProps {
  className?: string;
  onStepClick?: (step: CheckoutStep) => void;
}

// ====================
// Component
// ====================

export function CheckoutSteps({ className, onStepClick }: CheckoutStepsProps) {
  const { currentStep, getStepIndex, isStepComplete, canGoPrev } = useCheckout();
  const currentIndex = getStepIndex(currentStep);
  
  return (
    <nav aria-label="Checkout progress" className={cn('w-full', className)}>
      {/* Desktop view */}
      <ol className="hidden md:flex items-center justify-between">
        {CHECKOUT_STEPS.map((step, index) => {
          const isComplete = isStepComplete(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          const isClickable = isPast || isComplete;
          
          return (
            <li key={step.id} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center min-w-0 flex-1 group',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isComplete && 'bg-primary text-white',
                    isCurrent && !isComplete && 'bg-primary text-white ring-2 ring-primary ring-offset-2',
                    !isComplete && !isCurrent && 'bg-muted text-muted-foreground border-2 border-muted-foreground/20'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                
                {/* Step label */}
                <span
                  className={cn(
                    'mt-2 text-sm font-medium text-center',
                    isCurrent && 'text-primary',
                    isComplete && 'text-primary',
                    !isComplete && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
                
                {/* Step description */}
                <span className="text-xs text-muted-foreground text-center hidden lg:block">
                  {step.description}
                </span>
              </button>
              
              {/* Connector line */}
              {index < CHECKOUT_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">
            Step {currentIndex + 1} of {CHECKOUT_STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {CHECKOUT_STEPS[currentIndex]?.label}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / CHECKOUT_STEPS.length) * 100}%`,
            }}
          />
        </div>
        
        {/* Step description */}
        <p className="mt-2 text-xs text-muted-foreground text-center">
          {CHECKOUT_STEPS[currentIndex]?.description}
        </p>
      </div>
    </nav>
  );
}

// ====================
// Compact Step Indicator (for sidebars)
// ====================

export interface CompactStepIndicatorProps {
  className?: string;
}

export function CompactStepIndicator({ className }: CompactStepIndicatorProps) {
  const { currentStep, getStepIndex, isStepComplete } = useCheckout();
  const currentIndex = getStepIndex(currentStep);
  
  return (
    <div className={cn('space-y-1', className)}>
      {CHECKOUT_STEPS.slice(0, -1).map((step, index) => {
        const isComplete = isStepComplete(step.id);
        const isCurrent = step.id === currentStep;
        
        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
              isCurrent && 'bg-primary/10 text-primary font-medium',
              isComplete && !isCurrent && 'text-muted-foreground',
              !isComplete && !isCurrent && 'text-muted-foreground/50'
            )}
          >
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                isComplete && 'bg-primary text-white',
                isCurrent && !isComplete && 'border-2 border-primary text-primary',
                !isComplete && !isCurrent && 'border border-muted-foreground/30'
              )}
            >
              {isComplete ? <Check className="w-3 h-3" /> : index + 1}
            </span>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

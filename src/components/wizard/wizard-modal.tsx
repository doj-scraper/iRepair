"use client";

import * as React from "react";
import { ChevronLeft, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useWizard, useFirstVisit } from "@/hooks/use-wizard";
import { StepRouter } from "./wizard-steps";

// ====================
// Types
// ====================

interface WizardModalProps {
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ====================
// Step Labels
// ====================

const stepLabels: Record<string, string> = {
  intent: "Start",
  brand: "Brand",
  model: "Model",
  category: "Category",
  subcategory: "Device",
  results: "Results",
};

// ====================
// Component
// ====================

export function WizardModal({ forceOpen, onOpenChange }: WizardModalProps) {
  const wizard = useWizard();
  const { isFirstVisit, markAsVisited } = useFirstVisit();
  
  // Control open state
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Handle first visit auto-open
  React.useEffect(() => {
    if (isFirstVisit && !forceOpen) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit, forceOpen]);
  
  // Sync with forceOpen prop
  React.useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);
  
  // Handle open change
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      markAsVisited();
      wizard.closeWizard();
      wizard.reset();
    }
    onOpenChange?.(open);
  };
  
  // Handle close button
  const handleClose = () => {
    handleOpenChange(false);
  };
  
  // Handle back button
  const handleBack = () => {
    if (wizard.canGoBack) {
      wizard.goBack();
    }
  };
  
  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === "Escape") {
        handleClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);
  
  // Focus trap implementation
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (!isOpen) return;
    
    // Focus first focusable element when modal opens
    const timer = setTimeout(() => {
      const focusable = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isOpen, wizard.currentStep]);
  
  // Build step progress indicators
  const stepProgress = React.useMemo(() => {
    const steps = ["intent"];
    
    if (wizard.intent === "device") {
      steps.push("brand", "model", "results");
    } else if (wizard.intent === "part") {
      steps.push("category", "subcategory", "results");
    } else {
      steps.push("brand", "model", "results"); // Default path
    }
    
    return steps;
  }, [wizard.intent]);
  
  const currentStepIndex = stepProgress.indexOf(wizard.currentStep);
  const progressPercent = ((currentStepIndex + 1) / stepProgress.length) * 100;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={contentRef}
        className={cn(
          "sm:max-w-[500px] p-0 gap-0",
          "max-h-[90vh] overflow-hidden flex flex-col"
        )}
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          // Prevent closing on outside click
          e.preventDefault();
        }}
      >
        {/* Header */}
        <DialogHeader className="p-4 border-b space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {wizard.canGoBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <DialogTitle className="text-lg">
                Find Your Parts
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
              aria-label="Close wizard"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercent} className="h-1.5" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {stepProgress.map((step, index) => (
                <span
                  key={step}
                  className={cn(
                    "transition-colors",
                    index <= currentStepIndex
                      ? "text-primary font-medium"
                      : ""
                  )}
                >
                  {stepLabels[step]}
                </span>
              ))}
            </div>
          </div>
        </DialogHeader>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <DialogDescription className="sr-only">
            Step-by-step wizard to help you find the right parts
          </DialogDescription>
          
          <StepRouter
            currentStep={wizard.currentStep}
            state={wizard}
            actions={wizard}
            onClose={handleClose}
          />
        </div>
        
        {/* Footer with keyboard hints */}
        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd>
            {" "}to close •{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
            {" "}to navigate
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====================
// Controlled Wizard Modal
// ====================

interface ControlledWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ControlledWizardModal({
  open,
  onOpenChange,
}: ControlledWizardModalProps) {
  return (
    <WizardModal
      forceOpen={open}
      onOpenChange={onOpenChange}
    />
  );
}

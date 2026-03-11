"use client";

import * as React from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ====================
// Types
// ====================

interface WizardTriggerProps {
  onClick: () => void;
  variant?: "default" | "hero" | "inline";
  className?: string;
}

// ====================
// Component
// ====================

export function WizardTrigger({
  onClick,
  variant = "default",
  className,
}: WizardTriggerProps) {
  if (variant === "hero") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "group relative inline-flex items-center gap-3 px-6 py-4",
          "bg-primary text-primary-foreground rounded-xl",
          "font-semibold text-lg",
          "shadow-lg shadow-primary/25",
          "transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "active:scale-[0.98]",
          className
        )}
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <Search className="h-5 w-5" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-primary-light animate-pulse" />
          </div>
          <span>What are you looking for?</span>
        </div>
      </button>
    );
  }
  
  if (variant === "inline") {
    return (
      <Button
        onClick={onClick}
        variant="outline"
        className={cn(
          "justify-start text-muted-foreground hover:text-foreground",
          "border-dashed border-2",
          className
        )}
      >
        <Search className="h-4 w-4 mr-2" />
        What are you looking for today?
      </Button>
    );
  }
  
  // Default variant
  return (
    <Button
      onClick={onClick}
      className={cn(
        "gap-2",
        className
      )}
      size="lg"
    >
      <Search className="h-4 w-4" />
      What are you looking for?
    </Button>
  );
}

// ====================
// Hero CTA Component
// ====================

interface HeroCTAProps {
  onWizardOpen: () => void;
  className?: string;
}

export function HeroCTA({ onWizardOpen, className }: HeroCTAProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <WizardTrigger
        onClick={onWizardOpen}
        variant="hero"
      />
      <p className="text-sm text-muted-foreground">
        Find the right parts for your repair
      </p>
    </div>
  );
}

// ====================
// Floating Wizard Trigger
// ====================

interface FloatingWizardTriggerProps {
  onClick: () => void;
  isVisible?: boolean;
}

export function FloatingWizardTrigger({
  onClick,
  isVisible = true,
}: FloatingWizardTriggerProps) {
  if (!isVisible) return null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "flex items-center gap-2 px-4 py-3",
        "bg-primary text-primary-foreground rounded-full",
        "shadow-lg shadow-primary/25",
        "font-medium",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "active:scale-100"
      )}
      aria-label="Open product finder wizard"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Find Parts</span>
    </button>
  );
}

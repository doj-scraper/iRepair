"use client";

import { useState, useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Brand, PartCategory } from "@/types";
import { navigationTree, brandLabels, categoryLabels } from "@/lib/navigation-data";

// ====================
// Types
// ====================

export type WizardIntent = "device" | "part" | null;
export type WizardStep = 
  | "intent" 
  | "brand" 
  | "model" 
  | "category" 
  | "subcategory" 
  | "results";

export interface WizardState {
  intent: WizardIntent;
  brand: Brand | null;
  deviceModel: string | null;
  category: PartCategory | null;
  subcategory: string | null;
  currentStep: WizardStep;
}

export interface WizardActions {
  setIntent: (intent: WizardIntent) => void;
  setBrand: (brand: Brand) => void;
  setDeviceModel: (model: string) => void;
  setCategory: (category: PartCategory) => void;
  setSubcategory: (subcategory: string) => void;
  goBack: () => void;
  reset: () => void;
  goToStep: (step: WizardStep) => void;
}

export interface UseWizardReturn extends WizardState, WizardActions {
  isOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  canGoBack: boolean;
  progress: number;
  stepHistory: WizardStep[];
  filteredModels: { id: string; label: string }[];
  filteredCategories: { id: string; label: string }[];
}

// ====================
// Constants
// ====================

const WIZARD_COOKIE_NAME = "celltech-wizard-dismissed";
const COOKIE_EXPIRY_DAYS = 365;

const initialState: WizardState = {
  intent: null,
  brand: null,
  deviceModel: null,
  category: null,
  subcategory: null,
  currentStep: "intent",
};

// Step order for progress calculation
const stepOrder: WizardStep[] = ["intent", "brand", "model", "category", "subcategory", "results"];

// ====================
// Cookie Helpers
// ====================

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  
  for (const cookie of cookies) {
    let c = cookie;
    while (c.startsWith(" ")) c = c.substring(1);
    if (c.startsWith(nameEQ)) {
      return c.substring(nameEQ.length);
    }
  }
  
  return null;
}

// ====================
// Hook
// ====================

export function useWizard(): UseWizardReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [stepHistory, setStepHistory] = useState<WizardStep[]>(["intent"]);
  const [state, setState] = useState<WizardState>(() => {
    // Initialize from URL params if present
    const intent = searchParams.get("wizard") as WizardIntent;
    const brand = searchParams.get("brand") as Brand | null;
    const deviceModel = searchParams.get("model");
    const category = searchParams.get("category") as PartCategory | null;
    
    let currentStep: WizardStep = "intent";
    if (intent === "device") {
      if (deviceModel) currentStep = "results";
      else if (brand) currentStep = "model";
      else currentStep = "brand";
    } else if (intent === "part") {
      if (category) currentStep = "subcategory";
      else currentStep = "category";
    }
    
    return {
      intent: intent || null,
      brand: brand && Object.values(Brand).includes(brand) ? brand : null,
      deviceModel,
      category: category && Object.values(PartCategory).includes(category) ? category : null,
      subcategory: searchParams.get("subcategory"),
      currentStep,
    };
  });
  
  // URL sync effect
  useEffect(() => {
    if (!isOpen) return;
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Set wizard param to indicate wizard is active
    if (state.intent) {
      params.set("wizard", state.intent);
    } else {
      params.delete("wizard");
    }
    
    // Set other params based on state
    if (state.brand) params.set("brand", state.brand);
    else params.delete("brand");
    
    if (state.deviceModel) params.set("model", state.deviceModel);
    else params.delete("model");
    
    if (state.category) params.set("category", state.category);
    else params.delete("category");
    
    if (state.subcategory) params.set("subcategory", state.subcategory);
    else params.delete("subcategory");
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [state, isOpen, pathname, router, searchParams]);
  
  // Get filtered models based on selected brand
  const filteredModels = useMemo(() => {
    if (!state.brand) return [];
    
    const brandNode = navigationTree.find(
      (node) => node.id === `brand-${state.brand!.toLowerCase()}`
    );
    
    if (!brandNode?.children) return [];
    
    return brandNode.children
      .filter((device) => device.type === "device")
      .map((device) => ({
        id: device.id,
        label: device.label,
      }));
  }, [state.brand]);
  
  // Get filtered categories based on navigation data
  const filteredCategories = useMemo(() => {
    return Object.entries(categoryLabels).map(([key, label]) => ({
      id: key,
      label,
    }));
  }, []);
  
  // Calculate progress
  const progress = useMemo(() => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    return Math.round(((currentIndex + 1) / stepOrder.length) * 100);
  }, [state.currentStep]);
  
  // Actions
  const setIntent = useCallback((intent: WizardIntent) => {
    setState((prev) => ({
      ...prev,
      intent,
      currentStep: intent === "device" ? "brand" : "category",
      brand: null,
      deviceModel: null,
      category: null,
      subcategory: null,
    }));
    setStepHistory((prev) => [...prev, intent === "device" ? "brand" : "category"]);
  }, []);
  
  const setBrand = useCallback((brand: Brand) => {
    setState((prev) => ({
      ...prev,
      brand,
      currentStep: "model",
      deviceModel: null,
    }));
    setStepHistory((prev) => [...prev, "model"]);
  }, []);
  
  const setDeviceModel = useCallback((model: string) => {
    setState((prev) => ({
      ...prev,
      deviceModel: model,
      currentStep: "results",
    }));
    setStepHistory((prev) => [...prev, "results"]);
  }, []);
  
  const setCategory = useCallback((category: PartCategory) => {
    setState((prev) => ({
      ...prev,
      category,
      currentStep: "subcategory",
      subcategory: null,
    }));
    setStepHistory((prev) => [...prev, "subcategory"]);
  }, []);
  
  const setSubcategory = useCallback((subcategory: string) => {
    setState((prev) => ({
      ...prev,
      subcategory,
      currentStep: "results",
    }));
    setStepHistory((prev) => [...prev, "results"]);
  }, []);
  
  const goBack = useCallback(() => {
    setStepHistory((prev) => {
      if (prev.length <= 1) return prev;
      
      const newHistory = prev.slice(0, -1);
      const newStep = newHistory[newHistory.length - 1];
      
      setState((prev) => ({
        ...prev,
        currentStep: newStep,
        // Reset dependent fields when going back
        ...(newStep === "intent" && {
          intent: null,
          brand: null,
          deviceModel: null,
          category: null,
          subcategory: null,
        }),
        ...(newStep === "brand" && {
          brand: null,
          deviceModel: null,
        }),
        ...(newStep === "model" && {
          deviceModel: null,
        }),
        ...(newStep === "category" && {
          category: null,
          subcategory: null,
        }),
        ...(newStep === "subcategory" && {
          subcategory: null,
        }),
      }));
      
      return newHistory;
    });
  }, []);
  
  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
    setStepHistory((prev) => [...prev, step]);
  }, []);
  
  const reset = useCallback(() => {
    setState(initialState);
    setStepHistory(["intent"]);
  }, []);
  
  const openWizard = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setCookie(WIZARD_COOKIE_NAME, "true", COOKIE_EXPIRY_DAYS);
  }, []);
  
  const canGoBack = stepHistory.length > 1;
  
  return {
    ...state,
    isOpen,
    openWizard,
    closeWizard,
    canGoBack,
    progress,
    stepHistory,
    filteredModels,
    filteredCategories,
    setIntent,
    setBrand,
    setDeviceModel,
    setCategory,
    setSubcategory,
    goBack,
    reset,
    goToStep,
  };
}

// ====================
// First Visit Detection Hook
// ====================

export function useFirstVisit(): {
  isFirstVisit: boolean;
  markAsVisited: () => void;
} {
  const isFirstVisit = useSyncExternalStore(
    // Subscribe function (no-op for cookies)
    () => () => {},
    // Get snapshot (client-side)
    () => !getCookie(WIZARD_COOKIE_NAME),
    // Get server snapshot
    () => false
  );

  const markAsVisited = useCallback(() => {
    setCookie(WIZARD_COOKIE_NAME, "true", COOKIE_EXPIRY_DAYS);
  }, []);

  return { isFirstVisit, markAsVisited };
}

// ====================
// Fuzzy Search Hook
// ====================

export function useWizardSearch<T extends { id: string; label: string }>(
  items: T[],
  searchQuery: string
): T[] {
  return useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase().trim();
    
    return items.filter((item) => {
      const label = item.label.toLowerCase();
      // Simple fuzzy matching - checks if characters appear in order
      let queryIndex = 0;
      for (const char of label) {
        if (query[queryIndex] === char) {
          queryIndex++;
          if (queryIndex === query.length) return true;
        }
      }
      // Also check if the query is a substring
      return label.includes(query);
    });
  }, [items, searchQuery]);
}

// ====================
// Brand Options
// ====================

export const brandOptions: { value: Brand; label: string }[] = [
  { value: Brand.Apple, label: brandLabels[Brand.Apple] },
  { value: Brand.Samsung, label: brandLabels[Brand.Samsung] },
  { value: Brand.Motorola, label: brandLabels[Brand.Motorola] },
  { value: Brand.Other, label: brandLabels[Brand.Other] },
];

// ====================
// Category Options
// ====================

export const categoryOptions: { value: PartCategory; label: string }[] = 
  Object.entries(categoryLabels).map(([key, label]) => ({
    value: key as PartCategory,
    label,
  }));

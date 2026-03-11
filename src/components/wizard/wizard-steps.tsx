"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Wrench, ChevronRight, Search, Apple, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Brand, PartCategory } from "@/types";
import {
  WizardState,
  WizardActions,
  brandOptions,
  categoryOptions,
  useWizardSearch,
} from "@/hooks/use-wizard";

// ====================
// Types
// ====================

interface StepProps {
  state: WizardState;
  actions: WizardActions;
  onClose: () => void;
}

interface SelectableCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}

// ====================
// Shared Components
// ====================

function StepHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search"
      />
    </div>
  );
}

function SelectableCard({
  icon,
  title,
  description,
  onClick,
  selected,
  disabled,
}: SelectableCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected && "ring-2 ring-primary bg-primary-light",
        disabled && "opacity-50 cursor-not-allowed hover:shadow-none"
      )}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          selected ? "bg-primary text-primary-foreground" : "bg-primary-light text-primary"
        )}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GridCard({
  title,
  subtitle,
  count,
  selected,
  onClick,
  icon,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  selected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected && "ring-2 ring-primary bg-primary-light"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {count !== undefined && (
          <Badge variant="secondary" className="flex-shrink-0">
            {count}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </CardContent>
    </Card>
  );
}

// ====================
// Intent Step
// ====================

export function IntentStep({ actions }: StepProps) {
  return (
    <div>
      <StepHeader
        title="What are you looking for today?"
        description="Select an option to help us guide you to the right products"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectableCard
          icon={<Smartphone className="h-6 w-6" />}
          title="I need a Device"
          description="Browse devices to find compatible parts"
          onClick={() => actions.setIntent("device")}
        />
        <SelectableCard
          icon={<Wrench className="h-6 w-6" />}
          title="I need a Part"
          description="Browse parts by category"
          onClick={() => actions.setIntent("part")}
        />
      </div>
    </div>
  );
}

// ====================
// Brand Step
// ====================

const brandIcons: Record<Brand, React.ReactNode> = {
  [Brand.Apple]: <Apple className="h-5 w-5" />,
  [Brand.Samsung]: <MonitorSmartphone className="h-5 w-5" />,
  [Brand.Motorola]: <Smartphone className="h-5 w-5" />,
  [Brand.Other]: <Smartphone className="h-5 w-5" />,
};

export function BrandStep({ state, actions }: StepProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredOptions = useWizardSearch(
    brandOptions.map((opt) => ({ id: opt.value, label: opt.label })),
    searchQuery
  );
  
  return (
    <div>
      <StepHeader
        title="Select a Brand"
        description="Choose the brand of the device you're looking for"
      />
      
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search brands..."
      />
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredOptions.map((option) => (
          <GridCard
            key={option.id}
            title={option.label}
            selected={state.brand === option.id}
            onClick={() => actions.setBrand(option.id as Brand)}
            icon={brandIcons[option.id as Brand]}
          />
        ))}
        
        {filteredOptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No brands found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

// ====================
// Model Step
// ====================

export function ModelStep({ state, actions }: StepProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredModels = useWizardSearch(
    state.filteredModels || [],
    searchQuery
  );
  
  const handleSelectModel = (modelId: string, modelLabel: string) => {
    actions.setDeviceModel(modelLabel);
    // Navigate to products page with filters
    router.push(`/products?brand=${state.brand}&model=${encodeURIComponent(modelLabel)}`);
  };
  
  return (
    <div>
      <StepHeader
        title="Select a Device Model"
        description={`Choose your ${state.brand ? brandOptions.find(b => b.value === state.brand)?.label : ""} device model`}
      />
      
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search models..."
      />
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredModels.map((model) => (
          <GridCard
            key={model.id}
            title={model.label}
            selected={state.deviceModel === model.label}
            onClick={() => handleSelectModel(model.id, model.label)}
            icon={<Smartphone className="h-5 w-5" />}
          />
        ))}
        
        {filteredModels.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No models found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

// ====================
// Category Step
// ====================

const categoryIcons: Record<string, React.ReactNode> = {
  Screens: <MonitorSmartphone className="h-5 w-5" />,
  Batteries: <Wrench className="h-5 w-5" />,
  Cameras: <Wrench className="h-5 w-5" />,
  ChargingPorts: <Wrench className="h-5 w-5" />,
  BackGlass: <Wrench className="h-5 w-5" />,
  Other: <Wrench className="h-5 w-5" />,
};

export function CategoryStep({ state, actions }: StepProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredCategories = useWizardSearch(
    categoryOptions.map((opt) => ({ id: opt.value, label: opt.label })),
    searchQuery
  );
  
  return (
    <div>
      <StepHeader
        title="Select a Part Category"
        description="Choose the type of part you're looking for"
      />
      
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search categories..."
      />
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredCategories.map((category) => (
          <GridCard
            key={category.id}
            title={category.label}
            selected={state.category === category.id}
            onClick={() => actions.setCategory(category.id as PartCategory)}
            icon={categoryIcons[category.id] || <Wrench className="h-5 w-5" />}
          />
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

// ====================
// Subcategory Step (for Part path)
// ====================

export function SubcategoryStep({ state, actions, onClose }: StepProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // For simplicity, subcategories are compatible device brands
  const subcategories = [
    { id: "apple", label: "Apple Devices" },
    { id: "samsung", label: "Samsung Devices" },
    { id: "motorola", label: "Motorola Devices" },
    { id: "other", label: "Other Devices" },
  ];
  
  const filteredSubcategories = useWizardSearch(subcategories, searchQuery);
  
  const handleSelectSubcategory = (subcategory: string) => {
    actions.setSubcategory(subcategory);
    // Navigate to products page with filters
    router.push(`/products?category=${state.category}&compatible=${subcategory}`);
    onClose();
  };
  
  return (
    <div>
      <StepHeader
        title="Select Compatible Devices"
        description={`Choose devices compatible with ${state.category ? categoryOptions.find(c => c.value === state.category)?.label : ""}`}
      />
      
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search devices..."
      />
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredSubcategories.map((subcategory) => (
          <GridCard
            key={subcategory.id}
            title={subcategory.label}
            selected={state.subcategory === subcategory.id}
            onClick={() => handleSelectSubcategory(subcategory.id)}
            icon={<Smartphone className="h-5 w-5" />}
          />
        ))}
        
        {filteredSubcategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No devices found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

// ====================
// Results Step
// ====================

export function ResultsStep({ state, onClose }: StepProps) {
  const router = useRouter();
  
  const handleViewResults = () => {
    const params = new URLSearchParams();
    
    if (state.intent === "device" && state.brand && state.deviceModel) {
      params.set("brand", state.brand);
      params.set("model", state.deviceModel);
    } else if (state.intent === "part" && state.category) {
      params.set("category", state.category);
      if (state.subcategory) {
        params.set("compatible", state.subcategory);
      }
    }
    
    router.push(`/products?${params.toString()}`);
    onClose();
  };
  
  return (
    <div>
      <StepHeader
        title="Ready to View Results"
        description="We've found products matching your selection"
      />
      
      <div className="space-y-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Your Selection:</h3>
            <div className="space-y-1 text-sm">
              {state.intent && (
                <p>
                  <span className="text-muted-foreground">Looking for:</span>{" "}
                  <span className="font-medium capitalize">{state.intent}</span>
                </p>
              )}
              {state.brand && (
                <p>
                  <span className="text-muted-foreground">Brand:</span>{" "}
                  <span className="font-medium">{brandOptions.find(b => b.value === state.brand)?.label}</span>
                </p>
              )}
              {state.deviceModel && (
                <p>
                  <span className="text-muted-foreground">Model:</span>{" "}
                  <span className="font-medium">{state.deviceModel}</span>
                </p>
              )}
              {state.category && (
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium">{categoryOptions.find(c => c.value === state.category)?.label}</span>
                </p>
              )}
              {state.subcategory && (
                <p>
                  <span className="text-muted-foreground">Compatible with:</span>{" "}
                  <span className="font-medium capitalize">{state.subcategory} devices</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Button
          onClick={handleViewResults}
          className="w-full"
          size="lg"
        >
          View Products
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ====================
// Step Router
// ====================

interface StepRouterProps extends StepProps {
  currentStep: string;
}

export function StepRouter({ currentStep, ...props }: StepRouterProps) {
  switch (currentStep) {
    case "intent":
      return <IntentStep {...props} />;
    case "brand":
      return <BrandStep {...props} />;
    case "model":
      return <ModelStep {...props} />;
    case "category":
      return <CategoryStep {...props} />;
    case "subcategory":
      return <SubcategoryStep {...props} />;
    case "results":
      return <ResultsStep {...props} />;
    default:
      return <IntentStep {...props} />;
  }
}

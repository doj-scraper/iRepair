"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  variant?: "desktop" | "mobile";
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function SearchBar({
  className,
  placeholder = "Search products...",
  onSearch,
  variant = "desktop",
  isExpanded = false,
  onToggle,
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search (300ms)
  const debouncedSearch = React.useCallback(
    (searchQuery: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearch?.(searchQuery);
      }, 300);

      setDebounceTimer(timer);
    },
    [onSearch, debounceTimer]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut: Cmd/Ctrl + K to focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (variant === "mobile" && onToggle) {
          onToggle();
        }
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [variant, onToggle]);

  // Mobile variant - icon button that expands to search overlay
  if (variant === "mobile") {
    if (!isExpanded) {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>
      );
    }

    return (
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 bg-background border-b p-4 animate-slide-in-top",
          className
        )}
        role="search"
      >
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              type="search"
              value={query}
              onChange={handleChange}
              placeholder={placeholder}
              className="pl-10 pr-10"
              aria-label="Search products"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="shrink-0"
          >
            Cancel
          </Button>
        </div>
        <p className="sr-only" aria-live="polite">
          Search expanded. Type to search products.
        </p>
      </div>
    );
  }

  // Desktop variant - inline search bar
  return (
    <div
      className={cn("relative w-full max-w-md", className)}
      role="search"
    >
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-20"
        aria-label="Search products"
      />
      {query ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-9 top-1/2 -translate-y-1/2 h-7 w-7"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}

export default SearchBar;

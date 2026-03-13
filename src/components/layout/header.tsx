"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  Sun,
  Moon,
  User,
  ChevronDown,
  LogIn,
  UserPlus,
  Settings,
  Package,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle, useTheme } from "@/components/theme-provider";
import { SearchBar } from "./search-bar";
import { MobileMenu } from "./mobile-menu";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({
  isAuthenticated = false,
  userName,
  userEmail,
  onLogout,
  onSearch,
}: HeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { items, getTotalItems } = useCartStore();
  const openCart = useUIStore((state) => state.openCart);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const cartItemCount = getTotalItems();

  // Navigation items for desktop
  const navItems = [
    { label: "Products", href: "/products" },
    { label: "Orders", href: "/orders" },
  ];

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          isMobileSearchOpen && "hidden"
        )}
        role="banner"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left Section: Logo + Desktop Nav */}
            <div className="flex items-center gap-6">
              {/* Mobile Menu Trigger */}
              <MobileMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                }
                isAuthenticated={isAuthenticated}
                userName={userName}
                onLogout={onLogout}
              />

              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 shrink-0"
                aria-label="CellTech Distributor - Home"
              >
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">CT</span>
                </div>
                <span className="hidden sm:inline-block font-semibold text-lg">
                  CellTech Distributor
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav
                className="hidden lg:flex items-center gap-1"
                aria-label="Main navigation"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center Section: Search Bar (Desktop) */}
            <div className="hidden lg:block flex-1 max-w-md mx-4">
              <SearchBar onSearch={onSearch} />
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {/* Request a Quote Link - Always visible */}
              <Link
                href="/quote-request"
                className={cn(
                  "hidden sm:inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "h-9 px-4 py-2"
                )}
              >
                Request a Quote
              </Link>

              {/* Theme Toggle (Desktop) */}
              <div className="hidden sm:block">
                <ThemeToggle className="h-9 w-9 rounded-lg border bg-background hover:bg-accent flex items-center justify-center" />
              </div>

              {/* Search Icon (Mobile) */}
              <SearchBar
                variant="mobile"
                isExpanded={isMobileSearchOpen}
                onToggle={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                onSearch={onSearch}
              />

              {/* Cart Icon with Badge */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={`Shopping cart with ${cartItemCount} items`}
                onClick={openCart}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="default"
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                      "bg-primary text-primary-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <UserMenu
                isAuthenticated={isAuthenticated}
                userName={userName}
                userEmail={userEmail}
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <SearchBar
          variant="mobile"
          isExpanded={isMobileSearchOpen}
          onToggle={() => setIsMobileSearchOpen(false)}
          onSearch={onSearch}
        />
      )}
    </>
  );
}

// Separate User Menu component for cleaner code
function UserMenu({
  isAuthenticated,
  userName,
  userEmail,
  onLogout,
}: {
  isAuthenticated: boolean;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}) {
  const { resolvedTheme } = useTheme();

  if (!isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            aria-label="User menu"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/login" className="flex items-center gap-2 w-full">
              <LogIn className="h-4 w-4" />
              <span>Log in</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/register" className="flex items-center gap-2 w-full">
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hidden sm:flex items-center gap-2 h-9 px-2"
          aria-label="User menu"
        >
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-xs">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <span className="hidden md:inline-block text-sm font-medium max-w-[100px] truncate">
            {userName || "Account"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 w-full">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center gap-2 w-full">
            <Package className="h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 w-full">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Header;

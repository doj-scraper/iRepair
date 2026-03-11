"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingBag,
  FileText,
  User,
  LogIn,
  UserPlus,
  Settings,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Products", href: "/products", icon: <Package className="h-5 w-5" /> },
  { label: "Orders", href: "/orders", icon: <ShoppingBag className="h-5 w-5" /> },
  { label: "Quote Requests", href: "/quotes", icon: <FileText className="h-5 w-5" /> },
];

const userNavItems: NavItem[] = [
  { label: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  { label: "Help", href: "/help", icon: <HelpCircle className="h-5 w-5" /> },
];

interface MobileMenuProps {
  trigger: React.ReactNode;
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function MobileMenu({
  trigger,
  isAuthenticated = false,
  userName,
  onLogout,
}: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { resolvedTheme } = useTheme();

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] p-0 flex flex-col"
        aria-label="Mobile navigation menu"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left">
            <Link href="/" className="flex items-center gap-2" onClick={handleNavClick}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CT</span>
              </div>
              <span className="font-semibold text-lg">CellTech Distributor</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* User greeting if authenticated */}
        {isAuthenticated && userName && (
          <div className="px-4 py-3 bg-accent/50">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="font-medium truncate">{userName}</p>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
          <ul className="space-y-1 px-2">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {pathname === item.href && (
                    <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          {/* Request a Quote link */}
          <div className="px-2">
            <Link
              href="/quote-request"
              onClick={handleNavClick}
              className="flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Request a Quote
            </Link>
          </div>

          <Separator className="my-4" />

          {/* User Navigation or Auth Links */}
          {isAuthenticated ? (
            <ul className="space-y-1 px-2">
              {userNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    handleNavClick();
                    onLogout?.();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                  <LogIn className="h-5 w-5 rotate-180" />
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          ) : (
            <ul className="space-y-1 px-2">
              <li>
                <Link
                  href="/login"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Log in</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="border-t p-4 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle className="h-9 w-9 rounded-lg border bg-background hover:bg-accent flex items-center justify-center" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileMenu;

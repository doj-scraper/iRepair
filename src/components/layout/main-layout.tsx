"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Footer } from "./footer";
import { FileExplorer } from "@/components/navigation/file-explorer";
import { CartDrawer } from "@/components/cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PanelLeftClose, PanelLeft, Menu } from "lucide-react";

/**
 * Main Layout Component for CellTech Distributor B2B Portal
 *
 * Features:
 * - Fixed header with navigation
 * - Collapsible sidebar (File Explorer) - desktop sidebar, mobile drawer
 * - Main content area
 * - Sticky footer
 * - WCAG 2.1 AA compliant
 * - Responsive breakpoints (sm, md, lg)
 * - Theme support via ThemeProvider
 *
 * Layout Structure:
 * - min-h-screen flex flex-col (for sticky footer)
 * - Header (fixed)
 * - flex-1 flex (sidebar + main content)
 * - Footer (mt-auto)
 */

interface MainLayoutProps {
  children: React.ReactNode;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Authenticated user's name */
  userName?: string;
  /** Authenticated user's email */
  userEmail?: string;
  /** Logout callback */
  onLogout?: () => void;
  /** Search callback */
  onSearch?: (query: string) => void;
  /** Additional class names for the main content area */
  className?: string;
  /** Whether to show the sidebar on desktop */
  showSidebar?: boolean;
}

export function MainLayout({
  children,
  isAuthenticated = false,
  userName,
  userEmail,
  onLogout,
  onSearch,
  className,
  showSidebar = true,
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Handle responsive behavior
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Close mobile drawer when switching to desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle sidebar on desktop
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle sidebar open/close on mobile
  const handleMobileSidebarOpen = (open: boolean) => {
    setIsSidebarOpen(open);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content link - for keyboard accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      {/* Fixed Header */}
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
        onSearch={onSearch}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex pt-16">
        {" "}
        {/* pt-16 to account for fixed header */}
        {/* Desktop Sidebar - Persistent on lg screens */}
        {showSidebar && !isMobile && (
          <aside
            className={cn(
              "hidden lg:flex flex-col border-r bg-background transition-all duration-300",
              isSidebarCollapsed ? "w-16" : "w-72"
            )}
            role="navigation"
            aria-label="Product catalog sidebar"
          >
            {/* Sidebar Header with Toggle */}
            <div className="flex items-center justify-between p-2 border-b">
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium text-muted-foreground px-2">
                  Product Catalog
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebarCollapse}
                className={cn("h-8 w-8", isSidebarCollapsed && "mx-auto")}
                aria-label={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>

            {/* File Explorer Navigation */}
            <div className={cn("flex-1 overflow-hidden", isSidebarCollapsed && "hidden")}>
              <FileExplorer />
            </div>

            {/* Collapsed state - show icons only */}
            {isSidebarCollapsed && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <span className="text-xs text-center px-1">
                  Expand for catalog
                </span>
              </div>
            )}
          </aside>
        )}
        {/* Mobile Sidebar - Drawer/Sheet */}
        {showSidebar && isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={handleMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed bottom-4 left-4 z-50 lg:hidden rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Open product catalog"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-0 flex flex-col"
              aria-label="Product catalog navigation"
            >
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">Product Catalog</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <FileExplorer />
              </div>
            </SheetContent>
          </Sheet>
        )}
        {/* Main Content */}
        <main
          id="main-content"
          className={cn("flex-1 flex flex-col", className)}
          role="main"
          tabIndex={-1}
        >
          {/* Page Content */}
          <div className="flex-1">{children}</div>
        </main>
      </div>

      {/* Sticky Footer */}
      <Footer />

      {/* Cart Drawer - Global */}
      <CartDrawer />
    </div>
  );
}

export default MainLayout;

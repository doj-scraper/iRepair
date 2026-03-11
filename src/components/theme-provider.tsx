"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

/**
 * Theme Provider Component
 * 
 * Provides theme switching functionality using next-themes.
 * Configured for:
 * - Light mode as default
 * - System preference detection
 * - Smooth theme transitions
 * 
 * @see https://github.com/pacocoursey/next-themes
 */

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme to use (defaults to 'light') */
  defaultTheme?: "light" | "dark" | "system";
  /** Whether to store theme preference in localStorage */
  storageKey?: string;
  /** Whether to enable system preference detection */
  enableSystem?: boolean;
  /** Whether to disable transitions during theme change */
  disableTransitionOnChange?: boolean;
  /** Custom attribute to use for theme class */
  attribute?: "class" | "data-theme";
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "celltech-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  attribute = "class",
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Hook to access theme context
 * 
 * Returns:
 * - theme: Current theme ('light' | 'dark' | 'system')
 * - setTheme: Function to change theme
 * - resolvedTheme: Actual theme being used (resolves 'system')
 * - systemTheme: System preference ('light' | 'dark')
 * - themes: List of available themes
 * 
 * @example
 * const { theme, setTheme, resolvedTheme } = useTheme();
 * 
 * // Toggle theme
 * setTheme(theme === 'light' ? 'dark' : 'light');
 */
export function useTheme() {
  return useNextTheme();
}

/**
 * Theme Toggle Button Component
 * 
 * A pre-built toggle button for switching between light and dark modes.
 * Includes proper accessibility attributes and keyboard support.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className={className}
        aria-label="Toggle theme"
        disabled
        type="button"
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      title={`Currently in ${resolvedTheme} mode`}
    >
      <span className="sr-only">
        {resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </span>
      {resolvedTheme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Theme Select Component
 * 
 * A dropdown select for choosing between light, dark, and system themes.
 */
export function ThemeSelect({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <select className={className} disabled aria-label="Select theme">
        <option value="light">Light</option>
      </select>
    );
  }

  return (
    <select
      className={className}
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      aria-label="Select theme"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}

export default ThemeProvider;

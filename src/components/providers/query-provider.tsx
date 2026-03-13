"use client";

/**
 * TanStack Query Provider
 *
 * Wraps the application with a QueryClientProvider configured with
 * production-ready defaults:
 *   - staleTime: 60 seconds (data is fresh for 1 minute)
 *   - gcTime (cacheTime): 5 minutes (garbage-collected after 5 min of inactivity)
 *   - Retry: 3 attempts with exponential backoff
 *   - Refetch on window focus enabled
 *   - Global error handler for mutations
 */

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show toast for queries that have already been rendered
        // (i.e. not initial loads — those should be handled by the component)
        if (query.state.data !== undefined) {
          console.error("[QueryCache] Background refetch error:", error);
          toast({
            title: "Data refresh failed",
            description:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred while refreshing data.",
            variant: "destructive",
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        console.error("[MutationCache] Mutation error:", error);
        toast({
          title: "Action failed",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      },
    }),
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Cached data is garbage-collected after 5 minutes of inactivity
        gcTime: 5 * 60 * 1000,
        // Retry up to 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch stale data when the window regains focus
        refetchOnWindowFocus: true,
        // Do not refetch on reconnect by default (opt-in per query)
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

// Singleton for SSR — avoid re-creating on every render
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return makeQueryClient();
  }
  // Browser: reuse the same client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

// ─── Provider Component ──────────────────────────────────────────────────────

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

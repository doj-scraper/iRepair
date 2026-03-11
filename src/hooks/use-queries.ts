/**
 * TanStack Query Hooks
 *
 * Centralised query and mutation hooks for all API endpoints.
 * Provides type-safe data fetching with prefetching patterns.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import type {
  Product,
  Order,
  QuoteRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

// ─── Fetch Helper ────────────────────────────────────────────────────────────

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message ?? `Request failed with status ${res.status}`
    );
  }

  return res.json();
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["products", "list", filters] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    featured: ["products", "featured"] as const,
    brands: ["products", "brands"] as const,
    categories: ["products", "categories"] as const,
    deviceModels: (brand?: string) =>
      ["products", "device-models", brand] as const,
  },
  cart: {
    all: ["cart"] as const,
    current: ["cart", "current"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["orders", "list", filters] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  quotes: {
    all: ["quotes"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["quotes", "list", filters] as const,
  },
  presence: {
    active: ["presence", "active"] as const,
  },
  health: ["health"] as const,
} as const;

// ─── Product Queries ─────────────────────────────────────────────────────────

export function useProducts(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () =>
      apiFetch<ApiResponse<PaginatedResponse<Product>>>(
        `/api/products?${params.toString()}`
      ),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () =>
      apiFetch<ApiResponse<Product>>(`/api/products/${id}`),
    enabled: !!id,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.featured,
    queryFn: () =>
      apiFetch<ApiResponse<Product[]>>(
        `/api/products/featured?limit=${limit}`
      ),
    staleTime: 5 * 60 * 1000, // Featured products can be cached longer
  });
}

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.products.brands,
    queryFn: () => apiFetch<ApiResponse<unknown>>("/api/products/brands"),
    staleTime: 10 * 60 * 1000, // Brands rarely change
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: () =>
      apiFetch<ApiResponse<unknown>>("/api/products/categories"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useDeviceModels(brand?: string) {
  const params = brand ? `?brand=${brand}` : "";
  return useQuery({
    queryKey: queryKeys.products.deviceModels(brand),
    queryFn: () =>
      apiFetch<ApiResponse<unknown>>(
        `/api/products/device-models${params}`
      ),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Cart Queries & Mutations ────────────────────────────────────────────────

export function useCart(sessionId?: string) {
  const params = sessionId ? `?sessionId=${sessionId}` : "";
  return useQuery({
    queryKey: queryKeys.cart.current,
    queryFn: () => apiFetch<ApiResponse<unknown>>(`/api/cart${params}`),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      apiFetch<ApiResponse<unknown>>("/api/cart", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      quantity,
    }: {
      id: string;
      quantity: number;
    }) =>
      apiFetch<ApiResponse<unknown>>(`/api/cart/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<ApiResponse<unknown>>("/api/cart/clear", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

// ─── Order Queries & Mutations ───────────────────────────────────────────────

export function useOrders(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () =>
      apiFetch<ApiResponse<PaginatedResponse<Order>>>(
        `/api/orders?${params.toString()}`
      ),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () =>
      apiFetch<ApiResponse<Order>>(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<ApiResponse<Order>>("/api/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

// ─── Quote Queries & Mutations ───────────────────────────────────────────────

export function useQuotes(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: queryKeys.quotes.list(filters),
    queryFn: () =>
      apiFetch<ApiResponse<PaginatedResponse<QuoteRequest>>>(
        `/api/quotes?${params.toString()}`
      ),
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<ApiResponse<QuoteRequest>>("/api/quotes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
    },
  });
}

// ─── Contact Mutation ────────────────────────────────────────────────────────

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<ApiResponse<unknown>>("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

// ─── Presence ────────────────────────────────────────────────────────────────

export function useActiveUsers() {
  return useQuery({
    queryKey: queryKeys.presence.active,
    queryFn: () =>
      apiFetch<ApiResponse<{ users: string[]; count: number }>>(
        "/api/presence"
      ),
    refetchInterval: 30_000, // Poll every 30 seconds
  });
}

// ─── Health ──────────────────────────────────────────────────────────────────

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiFetch<Record<string, unknown>>("/api/health"),
    staleTime: 30_000,
  });
}

// ─── Prefetching ─────────────────────────────────────────────────────────────

/**
 * Prefetch featured products on the server or during idle time.
 */
export async function prefetchFeaturedProducts(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.featured,
    queryFn: () =>
      apiFetch<ApiResponse<Product[]>>("/api/products/featured?limit=8"),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch a single product (e.g. on hover over a product card).
 */
export async function prefetchProduct(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () =>
      apiFetch<ApiResponse<Product>>(`/api/products/${id}`),
  });
}

/**
 * Prefetch brands and categories for filter sidebar.
 */
export async function prefetchFilterData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.brands,
      queryFn: () => apiFetch<ApiResponse<unknown>>("/api/products/brands"),
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.categories,
      queryFn: () =>
        apiFetch<ApiResponse<unknown>>("/api/products/categories"),
      staleTime: 10 * 60 * 1000,
    }),
  ]);
}

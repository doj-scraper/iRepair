'use client';

import * as React from 'react';
import { ProductCard, MemoizedProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Package, Search } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

// ====================
// Types
// ====================

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  useMemoization?: boolean;
}

// ====================
// Skeleton Component
// ====================

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-muted">
        <Skeleton className="h-full w-full" />
      </div>

      <CardContent className="p-4">
        {/* SKU Skeleton */}
        <Skeleton className="h-3 w-20 mb-2" />

        {/* Name Skeleton */}
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-3/4 mb-2" />

        {/* Device Model Skeleton */}
        <Skeleton className="h-4 w-32 mb-3" />

        {/* Badges Skeleton */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Price Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex-col gap-3">
        {/* Quantity Selector Skeleton */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-14 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}

// ====================
// Empty State Component
// ====================

function EmptyState({
  message,
  description,
}: {
  message: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

// ====================
// Loading Grid Component
// ====================

function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// ====================
// Product Grid Component
// ====================

export function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
  emptyDescription = 'Try adjusting your search or filter criteria to find what you are looking for.',
  className,
  useMemoization = true,
}: ProductGridProps) {
  // Show loading skeleton
  if (isLoading) {
    return <LoadingGrid />;
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <EmptyState message={emptyMessage} description={emptyDescription} />
    );
  }

  // Use memoized version for better performance with large lists
  const CardComponent = useMemoization ? MemoizedProductCard : ProductCard;

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
    >
      {products.map((product) => (
        <CardComponent key={product.id} product={product} />
      ))}
    </div>
  );
}

/**
 * Product Grid with explicit loading state
 */
export function ProductGridWithLoader({
  products,
  isLoading,
  ...props
}: ProductGridProps) {
  if (isLoading) {
    return <LoadingGrid />;
  }

  return <ProductGrid products={products} {...props} />;
}

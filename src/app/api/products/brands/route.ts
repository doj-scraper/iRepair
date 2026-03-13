import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Brand } from '@prisma/client';

// API Response types
interface BrandInfo {
  name: string;
  slug: string;
  deviceModelCount: number;
  productCount: number;
}

interface BrandsResponse {
  success: boolean;
  data: BrandInfo[];
  error?: {
    code: string;
    message: string;
  };
}

export async function GET() {
  try {
    // Get all products with brand and device model
    const products = await db.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        brand: true,
        deviceModel: true,
      },
    });

    // Build brand statistics
    const brandStats = new Map<Brand, { models: Set<string>; count: number }>();

    for (const product of products) {
      const existing = brandStats.get(product.brand);
      if (existing) {
        existing.models.add(product.deviceModel);
        existing.count += 1;
      } else {
        brandStats.set(product.brand, {
          models: new Set([product.deviceModel]),
          count: 1,
        });
      }
    }

    // Convert to array and sort by product count descending
    const brands: BrandInfo[] = Array.from(brandStats.entries())
      .map(([brand, stats]) => ({
        name: formatBrandName(brand),
        slug: brand,
        deviceModelCount: stats.models.size,
        productCount: stats.count,
      }))
      .sort((a, b) => b.productCount - a.productCount);

    return NextResponse.json<BrandsResponse>({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Error fetching brands:', error);

    return NextResponse.json<BrandsResponse>(
      {
        success: false,
        data: [],
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching brands',
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to format brand names for display
function formatBrandName(brand: Brand): string {
  const brandNames: Record<Brand, string> = {
    Apple: 'Apple iPhone',
    Samsung: 'Samsung Galaxy',
    Motorola: 'Motorola',
    Other: 'Other Brands',
  };

  return brandNames[brand] || brand;
}

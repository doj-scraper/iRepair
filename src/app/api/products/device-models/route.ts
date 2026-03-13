import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Brand } from '@prisma/client';

// API Response types
interface DeviceModel {
  name: string;
  brand: string;
  productCount: number;
}

interface DeviceModelsResponse {
  success: boolean;
  data: Record<string, DeviceModel[]>;
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandParam = searchParams.get('brand');

    // Build where clause
    const where: { isActive: boolean; brand?: Brand } = {
      isActive: true,
    };

    if (brandParam) {
      const brandValue = brandParam as Brand;
      if (Object.values(Brand).includes(brandValue)) {
        where.brand = brandValue;
      }
    }

    // Get all products with device model info
    const products = await db.product.findMany({
      where,
      select: {
        brand: true,
        deviceModel: true,
      },
    });

    // Build device model stats grouped by brand
    const brandModelStats = new Map<string, Map<string, number>>();

    for (const product of products) {
      const brandKey = product.brand;
      const modelName = product.deviceModel;

      if (!brandModelStats.has(brandKey)) {
        brandModelStats.set(brandKey, new Map());
      }

      const modelMap = brandModelStats.get(brandKey)!;
      const currentCount = modelMap.get(modelName) || 0;
      modelMap.set(modelName, currentCount + 1);
    }

    // Convert to nested object structure
    const result: Record<string, DeviceModel[]> = {};

    for (const [brand, models] of brandModelStats.entries()) {
      result[brand] = Array.from(models.entries())
        .map(([name, count]) => ({
          name,
          brand,
          productCount: count,
        }))
        .sort((a, b) => {
          // Sort by product count descending, then alphabetically
          if (b.productCount !== a.productCount) {
            return b.productCount - a.productCount;
          }
          return a.name.localeCompare(b.name);
        });
    }

    return NextResponse.json<DeviceModelsResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching device models:', error);

    return NextResponse.json<DeviceModelsResponse>(
      {
        success: false,
        data: {},
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching device models',
        },
      },
      { status: 500 }
    );
  }
}

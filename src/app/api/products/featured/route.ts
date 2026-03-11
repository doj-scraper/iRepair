import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// API Response types
interface FeaturedProductResponse {
  id: string;
  sku: string;
  name: string;
  brand: string;
  deviceModel: string;
  category: string;
  qualityGrade: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  description: string | null;
  moq: number;
}

interface FeaturedProductsResponse {
  success: boolean;
  data: FeaturedProductResponse[];
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 20) : 8;

    // Fetch featured products
    // Strategy: Get products with good stock (indicating popular items), 
    // diverse across brands, sorted by newest
    const products = await db.product.findMany({
      where: {
        isActive: true,
        stockQty: { gt: 10 }, // Only products with good stock
      },
      orderBy: [
        { stockQty: 'desc' }, // Higher stock might indicate popular items
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Transform products for response
    const featuredProducts: FeaturedProductResponse[] = products.map((product) => {
      // Parse images JSON string
      let images: string[] = [];
      try {
        images = product.images ? JSON.parse(product.images) : [];
      } catch {
        images = [];
      }

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        deviceModel: product.deviceModel,
        category: product.partCategory,
        qualityGrade: product.qualityGrade,
        price: product.pricePerUnit,
        stockQuantity: product.stockQty,
        imageUrl: images.length > 0 ? images[0] : null,
        description: product.description,
        moq: product.moq,
      };
    });

    return NextResponse.json<FeaturedProductsResponse>({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);

    return NextResponse.json<FeaturedProductsResponse>(
      {
        success: false,
        data: [],
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching featured products',
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// API Response types
interface ProductDetailResponse {
  id: string;
  sku: string;
  name: string;
  brand: string;
  deviceModel: string;
  category: string;
  qualityGrade: string;
  price: number;
  stockQuantity: number;
  images: string[];
  description: string | null;
  moq: number;
  weightG: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SingleProductResponse {
  success: boolean;
  data?: ProductDetailResponse;
  relatedProducts?: ProductDetailResponse[];
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the product
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json<SingleProductResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    // Parse images JSON string
    let images: string[] = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch {
      images = [];
    }

    // Transform product for response
    const productDetail: ProductDetailResponse = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      deviceModel: product.deviceModel,
      category: product.partCategory,
      qualityGrade: product.qualityGrade,
      price: product.pricePerUnit,
      stockQuantity: product.stockQty,
      images,
      description: product.description,
      moq: product.moq,
      weightG: product.weightG,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Fetch related products (same brand and device model, or same category)
    const relatedProductsRaw = await db.product.findMany({
      where: {
        isActive: true,
        id: { not: id },
        OR: [
          {
            AND: [
              { brand: product.brand },
              { deviceModel: product.deviceModel },
            ],
          },
          { partCategory: product.partCategory },
        ],
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    // Transform related products
    const relatedProducts: ProductDetailResponse[] = relatedProductsRaw.map((p) => {
      let relatedImages: string[] = [];
      try {
        relatedImages = p.images ? JSON.parse(p.images) : [];
      } catch {
        relatedImages = [];
      }

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        deviceModel: p.deviceModel,
        category: p.partCategory,
        qualityGrade: p.qualityGrade,
        price: p.pricePerUnit,
        stockQuantity: p.stockQty,
        images: relatedImages,
        description: p.description,
        moq: p.moq,
        weightG: p.weightG,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json<SingleProductResponse>({
      success: true,
      data: productDetail,
      relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);

    return NextResponse.json<SingleProductResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the product',
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Brand, PartCategory, QualityGrade } from '@prisma/client';

// Query parameter validation schema
const productQuerySchema = z.object({
  brand: z.string().optional(),
  category: z.string().optional(),
  qualityGrade: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  inStock: z.string().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'oldest']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// API Response types
interface ProductResponse {
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
  isActive: boolean;
  createdAt: Date;
}

interface PaginatedProductsResponse {
  success: boolean;
  data: ProductResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = productQuerySchema.parse({
      brand: searchParams.get('brand') || undefined,
      category: searchParams.get('category') || undefined,
      qualityGrade: searchParams.get('qualityGrade') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    // Pagination defaults
    const page = parseInt(queryParams.page || '1', 10);
    const limit = Math.min(Math.max(parseInt(queryParams.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      isActive: boolean;
      brand?: Brand;
      partCategory?: PartCategory;
      qualityGrade?: QualityGrade;
      pricePerUnit?: { gte?: number; lte?: number };
      stockQty?: { gt?: number };
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        sku?: { contains: string; mode: 'insensitive' };
        deviceModel?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      isActive: true,
    };

    // Brand filter
    if (queryParams.brand) {
      const brandValue = queryParams.brand as Brand;
      if (Object.values(Brand).includes(brandValue)) {
        where.brand = brandValue;
      }
    }

    // Category filter
    if (queryParams.category) {
      // Handle underscore to space conversion for category
      const categoryValue = queryParams.category.replace(/_/g, '_') as PartCategory;
      if (Object.values(PartCategory).includes(categoryValue)) {
        where.partCategory = categoryValue;
      }
    }

    // Quality grade filter
    if (queryParams.qualityGrade) {
      const gradeValue = queryParams.qualityGrade as QualityGrade;
      if (Object.values(QualityGrade).includes(gradeValue)) {
        where.qualityGrade = gradeValue;
      }
    }

    // Price range filter
    if (queryParams.minPrice || queryParams.maxPrice) {
      where.pricePerUnit = {};
      if (queryParams.minPrice) {
        where.pricePerUnit.gte = parseFloat(queryParams.minPrice);
      }
      if (queryParams.maxPrice) {
        where.pricePerUnit.lte = parseFloat(queryParams.maxPrice);
      }
    }

    // In stock filter
    if (queryParams.inStock === 'true') {
      where.stockQty = { gt: 0 };
    }

    // Search filter (full-text search using LIKE)
    if (queryParams.search) {
      const searchTerm = queryParams.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { deviceModel: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: Record<string, unknown> = { createdAt: 'desc' };
    switch (queryParams.sortBy) {
      case 'price-asc':
        orderBy = { pricePerUnit: 'asc' };
        break;
      case 'price-desc':
        orderBy = { pricePerUnit: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Execute queries
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Transform products for response
    const transformedProducts: ProductResponse[] = products.map((product) => {
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
        isActive: product.isActive,
        createdAt: product.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedProductsResponse = {
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching products',
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Brand, PartCategory, QualityGrade } from "@prisma/client";
import { z } from "zod";

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  brand: z.nativeEnum(Brand).optional(),
  category: z.nativeEnum(PartCategory).optional(),
  quality: z.nativeEnum(QualityGrade).optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(["name-asc", "name-desc", "price-asc", "price-desc", "newest", "oldest"]).default("newest"),
});

// Validation schema for creating a product
const createProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  brand: z.nativeEnum(Brand),
  deviceModel: z.string().min(1).max(100),
  partCategory: z.nativeEnum(PartCategory),
  qualityGrade: z.nativeEnum(QualityGrade),
  pricePerUnit: z.number().positive(),
  moq: z.number().int().positive().default(5),
  stockQty: z.number().int().min(0),
  images: z.array(z.string()).optional(),
  weightG: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/products - List all products with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validated = querySchema.safeParse(queryParams);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, search, brand, category, quality, inStock, sortBy } = validated.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { deviceModel: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brand) {
      where.brand = brand;
    }

    if (category) {
      where.partCategory = category;
    }

    if (quality) {
      where.qualityGrade = quality;
    }

    if (inStock !== undefined) {
      where.stockQty = inStock ? { gt: 0 } : { equals: 0 };
    }

    // Build orderBy clause
    let orderBy: Record<string, unknown>[] = [];
    switch (sortBy) {
      case "name-asc":
        orderBy = [{ name: "asc" }];
        break;
      case "name-desc":
        orderBy = [{ name: "desc" }];
        break;
      case "price-asc":
        orderBy = [{ pricePerUnit: "asc" }];
        break;
      case "price-desc":
        orderBy = [{ pricePerUnit: "desc" }];
        break;
      case "oldest":
        orderBy = [{ createdAt: "asc" }];
        break;
      case "newest":
      default:
        orderBy = [{ createdAt: "desc" }];
        break;
    }

    // Get total count
    const total = await db.product.count({ where });

    // Get products
    const products = await db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Transform products for API response
    const transformedProducts = products.map((product) => {
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
        description: product.description,
        brand: product.brand,
        deviceModel: product.deviceModel,
        category: product.partCategory,
        qualityGrade: product.qualityGrade,
        price: product.pricePerUnit,
        wholesalePrice: product.pricePerUnit,
        stockQuantity: product.stockQty,
        moq: product.moq,
        imageUrl: images[0] || null,
        images,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch products",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = createProductSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const productData = validated.data;

    // Check if SKU already exists
    const existingProduct = await db.product.findUnique({
      where: { sku: productData.sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SKU_EXISTS",
            message: "A product with this SKU already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        brand: productData.brand,
        deviceModel: productData.deviceModel,
        partCategory: productData.partCategory,
        qualityGrade: productData.qualityGrade,
        pricePerUnit: productData.pricePerUnit,
        moq: productData.moq,
        stockQty: productData.stockQty,
        images: JSON.stringify(productData.images || []),
        weightG: productData.weightG,
        isActive: productData.isActive,
      },
    });

    // Transform for response
    let images: string[] = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch {
      images = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        brand: product.brand,
        deviceModel: product.deviceModel,
        category: product.partCategory,
        qualityGrade: product.qualityGrade,
        price: product.pricePerUnit,
        wholesalePrice: product.pricePerUnit,
        stockQuantity: product.stockQty,
        moq: product.moq,
        imageUrl: images[0] || null,
        images,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create product",
        },
      },
      { status: 500 }
    );
  }
}

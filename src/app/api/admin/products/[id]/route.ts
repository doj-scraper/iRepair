import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Brand, PartCategory, QualityGrade } from "@prisma/client";
import { z } from "zod";

// Validation schema for updating a product
const updateProductSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  brand: z.nativeEnum(Brand).optional(),
  deviceModel: z.string().min(1).max(100).optional(),
  partCategory: z.nativeEnum(PartCategory).optional(),
  qualityGrade: z.nativeEnum(QualityGrade).optional(),
  pricePerUnit: z.number().positive().optional(),
  moq: z.number().int().positive().optional(),
  stockQty: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  weightG: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Helper to transform product for API response
function transformProduct(product: {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  brand: Brand;
  deviceModel: string;
  partCategory: PartCategory;
  qualityGrade: QualityGrade;
  pricePerUnit: number;
  moq: number;
  stockQty: number;
  images: string;
  weightG: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
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
    weightG: product.weightG,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformProduct(product),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch product",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validated = updateProductSchema.safeParse(body);
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

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        },
        { status: 404 }
      );
    }

    // If SKU is being updated, check for conflicts
    if (validated.data.sku && validated.data.sku !== existingProduct.sku) {
      const skuConflict = await db.product.findUnique({
        where: { sku: validated.data.sku },
      });

      if (skuConflict) {
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
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validated.data.sku !== undefined) updateData.sku = validated.data.sku;
    if (validated.data.name !== undefined) updateData.name = validated.data.name;
    if (validated.data.description !== undefined) updateData.description = validated.data.description;
    if (validated.data.brand !== undefined) updateData.brand = validated.data.brand;
    if (validated.data.deviceModel !== undefined) updateData.deviceModel = validated.data.deviceModel;
    if (validated.data.partCategory !== undefined) updateData.partCategory = validated.data.partCategory;
    if (validated.data.qualityGrade !== undefined) updateData.qualityGrade = validated.data.qualityGrade;
    if (validated.data.pricePerUnit !== undefined) updateData.pricePerUnit = validated.data.pricePerUnit;
    if (validated.data.moq !== undefined) updateData.moq = validated.data.moq;
    if (validated.data.stockQty !== undefined) updateData.stockQty = validated.data.stockQty;
    if (validated.data.images !== undefined) updateData.images = JSON.stringify(validated.data.images);
    if (validated.data.weightG !== undefined) updateData.weightG = validated.data.weightG;
    if (validated.data.isActive !== undefined) updateData.isActive = validated.data.isActive;

    // Update product
    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: transformProduct(product),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update product",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          take: 1,
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if product has associated orders
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_IN_USE",
            message: "Cannot delete product that has been ordered. Consider marking it as inactive instead.",
          },
        },
        { status: 400 }
      );
    }

    // Delete product
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete product",
        },
      },
      { status: 500 }
    );
  }
}

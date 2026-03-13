import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { MOQ } from '@/lib/validations';
import {
  parseCartItems,
  serializeCartItems,
  buildCartResponse,
} from '../route';

// ====================
// Types
// ====================

interface GuestCartItem {
  productId: string;
  quantity: number;
}

interface CartApiResponse {
  success: boolean;
  data?: unknown;
  warning?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ====================
// Validation Schema
// ====================

const mergeCartSchema = z.object({
  guestSessionId: z.string().min(1, 'Guest session ID is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required to merge'),
});

// ====================
// Helper Functions
// ====================

function getUserId(request: NextRequest): string | null {
  const headerUserId = request.headers.get('x-user-id');
  return headerUserId || null;
}

// ====================
// POST /api/cart/merge - Merge guest cart with user cart
// ====================

export async function POST(request: NextRequest): Promise<NextResponse<CartApiResponse>> {
  try {
    const body = await request.json();
    const userId = getUserId(request);

    // User must be authenticated
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User must be authenticated to merge cart',
          },
        },
        { status: 401 }
      );
    }

    // Validate input
    let validatedData: z.infer<typeof mergeCartSchema>;
    try {
      validatedData = mergeCartSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.flatten().fieldErrors as Record<string, string[]>,
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { items: guestItems } = validatedData;

    // Get all product IDs from guest cart
    const productIds = guestItems.map((item) => item.productId);

    // Fetch all products in one query
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Find or create user's cart
    let userCart = await db.cart.findFirst({
      where: { userId },
    });

    const warnings: string[] = [];

    if (!userCart) {
      // Create new cart for user with merged items
      const mergedItems = guestItems
        .filter((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            warnings.push(`Product ${item.productId} not found or inactive`);
            return false;
          }
          if (product.stockQty < MOQ) {
            warnings.push(`Product "${product.name}" has insufficient stock`);
            return false;
          }
          return true;
        })
        .map((item) => {
          const product = productMap.get(item.productId)!;
          const effectiveMoq = product.moq || MOQ;
          const adjustedQuantity = Math.max(item.quantity, effectiveMoq);
          
          if (item.quantity < effectiveMoq) {
            warnings.push(`Product "${product.name}" quantity adjusted to ${effectiveMoq} (MOQ)`);
          }
          
          if (adjustedQuantity > product.stockQty) {
            warnings.push(`Product "${product.name}" quantity limited to ${product.stockQty} (stock available)`);
            return {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              productId: item.productId,
              quantity: product.stockQty,
              addedAt: new Date().toISOString(),
            };
          }
          
          return {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            productId: item.productId,
            quantity: adjustedQuantity,
            addedAt: new Date().toISOString(),
          };
        });

      userCart = await db.cart.create({
        data: {
          userId,
          sessionId: null,
          items: serializeCartItems(mergedItems),
        },
      });
    } else {
      // Merge with existing user cart
      const existingItems = parseCartItems(userCart.items);
      const existingItemMap = new Map(
        existingItems.map((item) => [item.productId, item])
      );

      // Process guest items
      for (const guestItem of guestItems) {
        const product = productMap.get(guestItem.productId);
        
        if (!product) {
          warnings.push(`Product ${guestItem.productId} not found or inactive`);
          continue;
        }

        if (product.stockQty < MOQ) {
          warnings.push(`Product "${product.name}" has insufficient stock`);
          continue;
        }

        const effectiveMoq = product.moq || MOQ;
        const existingItem = existingItemMap.get(guestItem.productId);

        if (existingItem) {
          // Merge quantities
          const newQuantity = existingItem.quantity + guestItem.quantity;
          
          if (newQuantity > product.stockQty) {
            existingItem.quantity = product.stockQty;
            warnings.push(`Product "${product.name}" total quantity limited to ${product.stockQty} (stock available)`);
          } else {
            existingItem.quantity = newQuantity;
          }
        } else {
          // Add new item
          let adjustedQuantity = Math.max(guestItem.quantity, effectiveMoq);
          
          if (guestItem.quantity < effectiveMoq) {
            warnings.push(`Product "${product.name}" quantity adjusted to ${effectiveMoq} (MOQ)`);
          }
          
          if (adjustedQuantity > product.stockQty) {
            adjustedQuantity = product.stockQty;
            warnings.push(`Product "${product.name}" quantity limited to ${product.stockQty} (stock available)`);
          }
          
          const newItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            productId: guestItem.productId,
            quantity: adjustedQuantity,
            addedAt: new Date().toISOString(),
          };
          
          existingItems.push(newItem);
        }
      }

      // Update user cart
      userCart = await db.cart.update({
        where: { id: userCart.id },
        data: {
          items: serializeCartItems(existingItems),
        },
      });
    }

    // Delete the guest cart if it exists
    try {
      await db.cart.deleteMany({
        where: {
          sessionId: validatedData.guestSessionId,
          userId: null,
        },
      });
    } catch {
      // Ignore errors when deleting guest cart
    }

    const cartResponse = await buildCartResponse(userCart);

    return NextResponse.json({
      success: true,
      data: cartResponse,
      warning: warnings.length > 0 ? warnings.join('; ') : undefined,
    });
  } catch (error) {
    console.error('Error merging cart:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while merging the cart',
        },
      },
      { status: 500 }
    );
  }
}

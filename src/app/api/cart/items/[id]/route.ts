import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { MOQ } from '@/lib/validations';
import {
  parseCartItems,
  serializeCartItems,
  buildCartResponse,
} from '../../route';

// ====================
// Types
// ====================

interface CartApiResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ====================
// Validation Schemas
// ====================

const updateQuantitySchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(MOQ, `Minimum order quantity is ${MOQ} units`),
});

// ====================
// Helper Functions
// ====================

function getSessionId(request: NextRequest): string {
  const headerSessionId = request.headers.get('x-session-id');
  if (headerSessionId) {
    return headerSessionId;
  }
  const cookieSessionId = request.cookies.get('session-id')?.value;
  if (cookieSessionId) {
    return cookieSessionId;
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getUserId(request: NextRequest): string | null {
  const headerUserId = request.headers.get('x-user-id');
  return headerUserId || null;
}

// ====================
// PUT /api/cart/items/[id] - Update cart item quantity
// ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CartApiResponse>> {
  try {
    const { id: cartItemId } = await params;
    const body = await request.json();
    const userId = getUserId(request);
    const sessionId = getSessionId(request);

    // Validate input
    let validatedData: z.infer<typeof updateQuantitySchema>;
    try {
      validatedData = updateQuantitySchema.parse(body);
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

    const { quantity } = validatedData;

    // Find cart
    let cart = null;
    if (userId) {
      cart = await db.cart.findFirst({
        where: { userId },
      });
    } else {
      cart = await db.cart.findFirst({
        where: { sessionId },
      });
    }

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CART_NOT_FOUND',
            message: 'Cart not found',
          },
        },
        { status: 404 }
      );
    }

    // Parse cart items
    const cartItems = parseCartItems(cart.items);
    const itemIndex = cartItems.findIndex((item) => item.id === cartItemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Cart item not found',
          },
        },
        { status: 404 }
      );
    }

    // Get product to check stock and MOQ
    const product = await db.product.findUnique({
      where: { id: cartItems[itemIndex].productId },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product no longer exists',
          },
        },
        { status: 404 }
      );
    }

    // Check stock availability
    if (product.stockQty < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Only ${product.stockQty} units available`,
          },
        },
        { status: 400 }
      );
    }

    // Update quantity
    cartItems[itemIndex].quantity = quantity;

    // Save updated cart
    cart = await db.cart.update({
      where: { id: cart.id },
      data: {
        items: serializeCartItems(cartItems),
      },
    });

    const cartResponse = await buildCartResponse(cart);

    return NextResponse.json({
      success: true,
      data: cartResponse,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating the cart item',
        },
      },
      { status: 500 }
    );
  }
}

// ====================
// DELETE /api/cart/items/[id] - Remove item from cart
// ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CartApiResponse>> {
  try {
    const { id: cartItemId } = await params;
    const userId = getUserId(request);
    const sessionId = getSessionId(request);

    // Find cart
    let cart = null;
    if (userId) {
      cart = await db.cart.findFirst({
        where: { userId },
      });
    } else {
      cart = await db.cart.findFirst({
        where: { sessionId },
      });
    }

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CART_NOT_FOUND',
            message: 'Cart not found',
          },
        },
        { status: 404 }
      );
    }

    // Parse cart items
    const cartItems = parseCartItems(cart.items);
    const itemIndex = cartItems.findIndex((item) => item.id === cartItemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Cart item not found',
          },
        },
        { status: 404 }
      );
    }

    // Remove item
    cartItems.splice(itemIndex, 1);

    // Save updated cart
    cart = await db.cart.update({
      where: { id: cart.id },
      data: {
        items: serializeCartItems(cartItems),
      },
    });

    const cartResponse = await buildCartResponse(cart);

    return NextResponse.json({
      success: true,
      data: cartResponse,
    });
  } catch (error) {
    console.error('Error removing cart item:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while removing the cart item',
        },
      },
      { status: 500 }
    );
  }
}

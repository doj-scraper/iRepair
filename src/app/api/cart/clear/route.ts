import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildCartResponse } from '../route';

// ====================
// Types
// ====================

interface CartApiResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

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
// DELETE /api/cart/clear - Clear entire cart
// ====================

export async function DELETE(request: NextRequest): Promise<NextResponse<CartApiResponse>> {
  try {
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
      // No cart to clear - return empty cart response
      return NextResponse.json({
        success: true,
        data: {
          id: '',
          userId,
          sessionId: userId ? null : sessionId,
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          updatedAt: new Date(),
        },
      });
    }

    // Clear all items from cart
    cart = await db.cart.update({
      where: { id: cart.id },
      data: {
        items: '[]', // Empty array
      },
    });

    const cartResponse = await buildCartResponse(cart);

    return NextResponse.json({
      success: true,
      data: cartResponse,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while clearing the cart',
        },
      },
      { status: 500 }
    );
  }
}

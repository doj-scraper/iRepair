import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { addToCartSchema, MOQ } from '@/lib/validations';

// ====================
// Types
// ====================

interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
}

interface CartProduct {
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
  moq: number;
}

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
  product: CartProduct;
}

interface CartResponse {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemWithProduct[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  updatedAt: Date;
}

interface CartApiResponse {
  success: boolean;
  data?: CartResponse;
  warning?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ====================
// Helper Functions
// ====================

/**
 * Generate a unique ID for cart items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create a session ID from request
 */
function getSessionId(request: NextRequest): string {
  // Try to get from header first
  const headerSessionId = request.headers.get('x-session-id');
  if (headerSessionId) {
    return headerSessionId;
  }

  // Try to get from cookie
  const cookieSessionId = request.cookies.get('session-id')?.value;
  if (cookieSessionId) {
    return cookieSessionId;
  }

  // Generate a new session ID
  return generateId();
}

/**
 * Get user ID from request (if authenticated)
 */
function getUserId(request: NextRequest): string | null {
  // In a real app, this would come from auth session/token
  const headerUserId = request.headers.get('x-user-id');
  return headerUserId || null;
}

/**
 * Parse cart items from JSON string
 */
export function parseCartItems(itemsJson: string | null): CartItemData[] {
  if (!itemsJson) return [];
  try {
    const items = JSON.parse(itemsJson);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/**
 * Serialize cart items to JSON string
 */
export function serializeCartItems(items: CartItemData[]): string {
  return JSON.stringify(items);
}

/**
 * Transform product from Prisma to API format
 */
export function transformProduct(product: {
  id: string;
  sku: string;
  name: string;
  brand: string;
  deviceModel: string;
  partCategory: string;
  qualityGrade: string;
  pricePerUnit: number;
  stockQty: number;
  images: string | null;
  moq: number;
}): CartProduct {
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
    moq: product.moq,
  };
}

/**
 * Build cart response with product details
 */
export async function buildCartResponse(
  cart: { id: string; userId: string | null; sessionId: string | null; items: string; updatedAt: Date }
): Promise<CartResponse> {
  const cartItems = parseCartItems(cart.items);

  if (cartItems.length === 0) {
    return {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: [],
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      updatedAt: cart.updatedAt,
    };
  }

  // Fetch all products in the cart
  const productIds = cartItems.map((item) => item.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });

  // Create a map for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Build items with products
  const itemsWithProducts: CartItemWithProduct[] = cartItems
    .filter((item) => productMap.has(item.productId))
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      addedAt: item.addedAt,
      product: transformProduct(productMap.get(item.productId)!),
    }));

  // Calculate totals
  const totalQuantity = itemsWithProducts.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = itemsWithProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    items: itemsWithProducts,
    itemCount: itemsWithProducts.length,
    totalQuantity,
    subtotal,
    updatedAt: cart.updatedAt,
  };
}

// ====================
// GET /api/cart - Get current cart
// ====================

export async function GET(request: NextRequest): Promise<NextResponse<CartApiResponse>> {
  try {
    const userId = getUserId(request);
    const sessionId = getSessionId(request);

    // Find existing cart
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

    // If no cart exists, return empty cart
    if (!cart) {
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

    const cartResponse = await buildCartResponse(cart);

    return NextResponse.json({
      success: true,
      data: cartResponse,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the cart',
        },
      },
      { status: 500 }
    );
  }
}

// ====================
// POST /api/cart - Add item to cart
// ====================

export async function POST(request: NextRequest): Promise<NextResponse<CartApiResponse>> {
  try {
    const body = await request.json();
    const userId = getUserId(request);
    const sessionId = getSessionId(request);

    // Validate input
    let validatedData: z.infer<typeof addToCartSchema>;
    try {
      validatedData = addToCartSchema.parse(body);
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

    const { productId, quantity } = validatedData;

    // Check if product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_INACTIVE',
            message: 'This product is currently unavailable',
          },
        },
        { status: 400 }
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

    // Determine MOQ enforcement
    let finalQuantity = quantity;
    let warning: string | undefined;
    const effectiveMoq = product.moq || MOQ;

    // If quantity is below MOQ, auto-correct to MOQ
    if (quantity < effectiveMoq) {
      finalQuantity = effectiveMoq;
      warning = `Quantity adjusted to ${effectiveMoq} (minimum order quantity)`;
    }

    // Check if we have enough stock for the corrected quantity
    if (product.stockQty < finalQuantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Only ${product.stockQty} units available. Minimum order is ${effectiveMoq} units.`,
          },
        },
        { status: 400 }
      );
    }

    // Find or create cart
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
      // Create new cart
      const newCartItem: CartItemData = {
        id: generateId(),
        productId,
        quantity: finalQuantity,
        addedAt: new Date().toISOString(),
      };

      cart = await db.cart.create({
        data: {
          userId: userId || null,
          sessionId: userId ? null : sessionId,
          items: serializeCartItems([newCartItem]),
        },
      });
    } else {
      // Update existing cart
      const cartItems = parseCartItems(cart.items);
      const existingItemIndex = cartItems.findIndex((item) => item.productId === productId);

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const newQuantity = cartItems[existingItemIndex].quantity + finalQuantity;

        // Check stock for new total
        if (product.stockQty < newQuantity) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INSUFFICIENT_STOCK',
                message: `Cannot add more. You already have ${cartItems[existingItemIndex].quantity} in cart, and only ${product.stockQty} units are available.`,
              },
            },
            { status: 400 }
          );
        }

        cartItems[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cartItems.push({
          id: generateId(),
          productId,
          quantity: finalQuantity,
          addedAt: new Date().toISOString(),
        });
      }

      cart = await db.cart.update({
        where: { id: cart.id },
        data: {
          items: serializeCartItems(cartItems),
        },
      });
    }

    const cartResponse = await buildCartResponse(cart);

    return NextResponse.json({
      success: true,
      data: cartResponse,
      warning,
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while adding item to cart',
        },
      },
      { status: 500 }
    );
  }
}

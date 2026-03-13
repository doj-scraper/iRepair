import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Validation schema for creating an order
const createOrderSchema = z.object({
  // Contact Information
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  
  // Company (optional)
  companyName: z.string().optional(),
  
  // Shipping Address
  shippingAddress: z.object({
    recipientName: z.string().min(2),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(5),
    country: z.string().default('US'),
    phone: z.string().optional(),
  }),
  
  // Billing Address (optional if same as shipping)
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: z.object({
    recipientName: z.string().min(2),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(5),
    country: z.string().default('US'),
  }).optional(),
  
  // Shipping Method
  shippingMethod: z.string(),
  shippingCost: z.number().min(0),
  
  // Payment (mock for now - Stripe integration would go here)
  paymentMethod: z.enum(['card', 'apple_pay', 'google_pay']),
  paymentId: z.string().optional(), // Stripe payment intent ID
  
  // Items
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(5, 'Minimum order quantity is 5'),
    unitPrice: z.number().positive(),
  })).min(1, 'Order must have at least one item'),
  
  // Totals
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  
  // Notes
  notes: z.string().optional(),
  
  // User ID (for logged-in users)
  userId: z.string().optional(),
});

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CT-${timestamp}-${random}`;
}

// GET /api/orders - Get orders for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') as OrderStatus | null;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IDENTIFIER', message: 'User ID or email is required' } },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (userId) {
      where.userId = userId;
    } else if (email) {
      where.contactEmail = email;
    }
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' } },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify all products exist and have sufficient stock
    const productIds = validatedData.items.map(item => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PRODUCTS', message: 'One or more products not found' } },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;
      
      if (product.stockQty < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'INSUFFICIENT_STOCK', 
              message: `Insufficient stock for ${product.name}. Available: ${product.stockQty}` 
            } 
          },
          { status: 400 }
        );
      }

      // Verify MOQ
      if (item.quantity < product.moq) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'MOQ_VIOLATION', 
              message: `Minimum order quantity for ${product.name} is ${product.moq}` 
            } 
          },
          { status: 400 }
        );
      }
    }

    // Create order with items and update stock
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: validatedData.userId || null,
          contactEmail: validatedData.email,
          contactName: validatedData.name,
          contactPhone: validatedData.phone,
          status: OrderStatus.Processing,
          subtotal: validatedData.subtotal,
          shippingMethod: validatedData.shippingMethod,
          shippingCost: validatedData.shippingCost,
          tax: validatedData.tax,
          total: validatedData.total,
          shippingAddress: JSON.stringify(validatedData.shippingAddress),
          notes: validatedData.notes || null,
          items: {
            create: validatedData.items.map(item => {
              const product = products.find(p => p.id === item.productId)!;
              return {
                productId: item.productId,
                productName: product.name,
                productSku: product.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      // Update product stock
      for (const item of validatedData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: { decrement: item.quantity },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten() } },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' } },
      { status: 500 }
    );
  }
}

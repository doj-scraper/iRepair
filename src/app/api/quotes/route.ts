import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { QuoteStatus } from '@prisma/client';

// Validation schema for quote request
const createQuoteSchema = z.object({
  // Contact Information
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  
  // Company (optional)
  companyName: z.string().optional(),
  
  // Quote Details
  message: z.string().min(10, 'Please provide more details'),
  items: z.array(z.object({
    productName: z.string().min(2, 'Product name is required'),
    productSku: z.string().optional(),
    quantity: z.number().int().min(5, 'Minimum order quantity is 5'),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  
  // User ID (for logged-in users)
  userId: z.string().optional(),
  
  // File URL (optional - uploaded separately)
  fileUrl: z.string().url().optional(),
});

// GET /api/quotes - Get quote requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const status = searchParams.get('status') as QuoteStatus | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const where: Record<string, unknown> = {};
    
    // If userId or email provided, filter by that user
    if (userId) {
      where.userId = userId;
    } else if (email) {
      where.contactEmail = email;
    }
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    const [quotes, total] = await Promise.all([
      db.quoteRequest.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quoteRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: quotes,
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
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch quote requests' } },
      { status: 500 }
    );
  }
}

// POST /api/quotes - Create a new quote request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createQuoteSchema.parse(body);

    // Create the quote request
    const quoteRequest = await db.quoteRequest.create({
      data: {
        userId: validatedData.userId || null,
        contactEmail: validatedData.email,
        contactName: validatedData.name,
        contactPhone: validatedData.phone,
        message: validatedData.message,
        status: QuoteStatus.Pending,
        items: {
          create: validatedData.items.map(item => ({
            productName: item.productName,
            productSku: item.productSku || null,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: quoteRequest,
      message: 'Quote request submitted successfully. We will contact you within 24 hours.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten() } },
        { status: 400 }
      );
    }
    console.error('Error creating quote request:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit quote request' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PartCategory } from '@prisma/client';

// API Response types
interface CategoryCount {
  name: string;
  slug: string;
  count: number;
}

interface CategoriesResponse {
  success: boolean;
  data: CategoryCount[];
  error?: {
    code: string;
    message: string;
  };
}

export async function GET() {
  try {
    // Get all products and count by category
    const products = await db.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        partCategory: true,
      },
    });

    // Count products by category
    const categoryCounts = new Map<PartCategory, number>();
    
    for (const product of products) {
      const currentCount = categoryCounts.get(product.partCategory) || 0;
      categoryCounts.set(product.partCategory, currentCount + 1);
    }

    // Convert to array and sort by count descending
    const categories: CategoryCount[] = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        name: formatCategoryName(category),
        slug: category,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json<CategoriesResponse>({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);

    return NextResponse.json<CategoriesResponse>(
      {
        success: false,
        data: [],
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching categories',
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to format category names for display
function formatCategoryName(category: PartCategory): string {
  const categoryNames: Record<PartCategory, string> = {
    Screens: 'Screens & Displays',
    Batteries: 'Batteries',
    Charging_Ports: 'Charging Ports',
    Cameras: 'Cameras',
    Back_Glass: 'Back Glass',
    Other: 'Other Parts',
  };

  return categoryNames[category] || category;
}

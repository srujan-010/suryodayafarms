import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isVisible: true },
      include: {
        images: true,
        categories: true,
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const products = dbProducts.map((p) => {
      const totalReviews = p.reviews.length;
      const rating = totalReviews > 0
        ? parseFloat((p.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

      // Extract first category or fallback
      const primaryCategory = p.categories?.[0]?.name || 'Organic';

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.compareAtPrice || p.mrp || p.price,
        weight: p.weight || '500 g',
        rating,
        reviewsCount: totalReviews || 10, // Default fallback reviews count
        image: p.images?.[0]?.url || p.hoverImage || 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600',
        tag: p.categories?.[0]?.description || 'Direct Farm',
        description: p.description,
        category: primaryCategory,
        categories: p.categories || [],
        categoryId: p.categories?.[0]?.id || ''
      };
    });

    return NextResponse.json({
      success: true,
      products
    });
  } catch (error: any) {
    console.error('[GET Products Route Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

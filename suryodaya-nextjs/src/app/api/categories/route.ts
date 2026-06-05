import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error: any) {
    console.error('[GET Categories Route Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

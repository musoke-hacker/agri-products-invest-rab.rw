import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { price: 'asc' },
    });
    console.log('API FETCH: Products found:', products.length);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API FETCH ERROR: Products:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      message: error.message
    }, { status: 500 });
  }
}

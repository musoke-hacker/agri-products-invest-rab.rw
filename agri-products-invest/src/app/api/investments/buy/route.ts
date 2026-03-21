import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { addDays } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user || user.balance < product.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const startDate = new Date();
    const endDate = addDays(startDate, 5);

    // Atomic transaction for investment
    await prisma.$transaction([
      // Deduct balance
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { decrement: product.price },
          totalInvestment: { increment: product.price },
        },
      }),
      // Create investment
      prisma.investment.create({
        data: {
          userId: user.id,
          productId: product.id,
          amount: product.price,
          startDate,
          endDate,
          nextEarningsAt: addDays(startDate, 1),
          status: 'Active',
        },
      }),
      // Log transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'INVESTMENT',
          amount: product.price,
          status: 'SUCCESSFUL',
          notes: `Invested in ${product.name} (${product.code})`,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Investment successful' });
  } catch (error) {
    console.error('Investment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { investments: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if at least one investment cycle is completed
    const hasCompletedCycle = user.investments.some(inv => inv.status === 'Completed');
    if (!hasCompletedCycle) {
      return NextResponse.json({ error: 'Withdrawal allowed only after completing at least one 5-day investment cycle' }, { status: 400 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal request
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: parseFloat(amount) } }
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'WITHDRAWAL',
          amount: parseFloat(amount),
          status: 'PENDING',
          notes: `Withdrawal request to ${user.phone}`,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Withdrawal request submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

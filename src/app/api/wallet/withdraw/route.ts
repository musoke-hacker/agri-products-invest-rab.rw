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

    // Minimum withdrawal is 2000
    if (amount < 2000) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is 2000 RWF' }, { status: 400 });
    }

    // The ability to withdraw depends solely on the 2000 RWF minimum limit, 
    // which effectively delays small product owners to every 4-5 days while enabling daily for large products.

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

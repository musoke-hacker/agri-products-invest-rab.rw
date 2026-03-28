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

    // 1. Minimum withdrawal is 2000
    if (amount < 2000) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is 2000 RWF' }, { status: 400 });
    }

    // 2. Check 5-day frequency
    if (user.lastWithdrawal) {
      const now = new Date();
      const lastEx = new Date(user.lastWithdrawal);
      const diffDays = Math.floor((now.getTime() - lastEx.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 5) {
        return NextResponse.json({ 
          error: `You can only withdraw once every 5 days. Next withdrawal available in ${5 - diffDays} days.` 
        }, { status: 400 });
      }
    }

    const withdrawAmount = parseFloat(amount);
    if (user.balance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const fee = withdrawAmount * 0.10; // 10% fee
    const amountToUser = withdrawAmount - fee;

    // 3. Create withdrawal request
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { 
          balance: { decrement: withdrawAmount },
          lastWithdrawal: new Date()
        }
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'WITHDRAWAL',
          amount: withdrawAmount,
          status: 'PENDING',
          notes: `Withdrawal request. Amount to pay client: ${amountToUser} RWF after 10% fee.`,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Withdrawal request submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

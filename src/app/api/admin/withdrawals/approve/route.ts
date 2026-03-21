import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId, status, notes } = await req.json(); // status: 'SUCCESSFUL', 'PROCESSING', 'REJECTED'

    const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx || tx.type !== 'WITHDRAWAL') return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status, notes: notes || tx.notes }
      }),
      prisma.notification.create({
        data: {
          userId: tx.userId,
          message: `Your withdrawal of ${tx.amount} RWF is now ${status.toLowerCase()}. ${notes || ''}`,
          type: 'IN_APP'
        }
      })
    ]);

    // If rejected, refund balance
    if (status === 'REJECTED') {
      await prisma.user.update({
        where: { id: tx.userId },
        data: { balance: { increment: tx.amount } }
      });
    }

    return NextResponse.json({ message: `Withdrawal ${status.toLowerCase()}` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

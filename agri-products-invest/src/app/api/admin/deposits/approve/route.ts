import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId, status } = await req.json(); // status: 'SUCCESSFUL' or 'REJECTED'

    const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx || tx.type !== 'DEPOSIT' || tx.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
    }

    if (status === 'SUCCESSFUL') {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'SUCCESSFUL' }
        }),
        prisma.user.update({
          where: { id: tx.userId },
          data: { balance: { increment: tx.amount } }
        }),
        prisma.notification.create({
          data: {
            userId: tx.userId,
            message: `Your deposit of ${tx.amount} RWF has been approved!`,
            type: 'IN_APP'
          }
        })
      ]);
    } else {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'REJECTED' }
      });
    }

    return NextResponse.json({ message: `Deposit ${status.toLowerCase()}` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, reference } = await req.json();

    if (!amount || !reference) {
      return NextResponse.json({ error: 'Amount and reference are required' }, { status: 400 });
    }

    // Create a pending deposit transaction
    await prisma.transaction.create({
      data: {
        userId: authUser.id,
        type: 'DEPOSIT',
        amount: parseFloat(amount),
        status: 'PENDING',
        reference,
        notes: 'Deposit request submitted',
      },
    });

    return NextResponse.json({ message: 'Deposit request submitted for approval' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

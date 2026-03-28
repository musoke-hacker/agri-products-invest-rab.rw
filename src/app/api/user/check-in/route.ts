import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { startOfDay, isSameDay } from 'date-fns';

export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if already checked in today
    const now = new Date();
    if (user.lastCheckIn && isSameDay(user.lastCheckIn, now)) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
    }

    // Update user and add bonus
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: 50 },
          lastCheckIn: now,
          checkInCount: { increment: 1 },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'BONUS',
          amount: 50,
          status: 'SUCCESSFUL',
          notes: `Daily check-in bonus`,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Check-in successful! +50 RWF added.' });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { updateUserEarnings } from '@/lib/earnings';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Trigger earnings update (Lazy update)
    await updateUserEarnings(authUser.id);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        _count: {
          select: { investments: { where: { status: 'Active' } } }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const stats = {
      balance: user.balance,
      totalInvestment: user.totalInvestment,
      totalEarnings: user.totalEarnings,
      todayEarnings: user.todayEarnings,
      activeInvestments: user._count.investments,
      phone: user.phone,
      referralCode: user.referralCode,
      checkInCount: user.checkInCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

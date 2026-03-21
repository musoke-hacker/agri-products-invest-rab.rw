import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        balance: true,
        countryCode: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Level 1
    const l1Users = await prisma.user.findMany({ where: { referredBy: user.referralCode } });
    
    // Level 2
    let l2Users = [];
    if (l1Users.length > 0) {
      l2Users = await prisma.user.findMany({
        where: { referredBy: { in: l1Users.map(u => u.referralCode) } }
      });
    }

    // Level 3
    let l3Users = [];
    if (l2Users.length > 0) {
      l3Users = await prisma.user.findMany({
        where: { referredBy: { in: l2Users.map(u => u.referralCode) } }
      });
    }

    return NextResponse.json({
      level1: l1Users.length,
      level2: l2Users.length,
      level3: l3Users.length,
      total: l1Users.length + l2Users.length + l3Users.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

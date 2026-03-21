import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const investments = await prisma.investment.findMany({
      where: { 
        userId: authUser.id,
        status: 'Active'
      },
      include: {
        product: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json(investments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

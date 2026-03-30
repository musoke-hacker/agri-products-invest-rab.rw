import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, message } = await req.json();
    if (!userId || !message?.trim()) {
      return NextResponse.json({ error: 'userId and message are required' }, { status: 400 });
    }

    // Mark all unread user messages as read
    await prisma.supportMessage.updateMany({
      where: { userId, fromAdmin: false, isRead: false },
      data: { isRead: true },
    });

    const msg = await prisma.supportMessage.create({
      data: {
        userId,
        message: message.trim(),
        fromAdmin: true,
        isRead: false,
      },
    });

    return NextResponse.json(msg);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}

// GET: messages for a specific user (admin view conversation)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark user messages as read by admin
    await prisma.supportMessage.updateMany({
      where: { userId, fromAdmin: false, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

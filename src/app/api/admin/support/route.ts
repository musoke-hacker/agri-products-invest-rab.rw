import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET: all conversations for admin
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const conversations = await prisma.supportMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, phone: true, name: true, profileImage: true, lastSeen: true }
        }
      }
    });

    // Group messages by userId
    const grouped: Record<string, any> = {};
    for (const msg of conversations) {
      if (!grouped[msg.userId]) {
        grouped[msg.userId] = {
          user: msg.user,
          messages: [],
          unreadCount: 0,
          lastMessage: null,
        };
      }
      grouped[msg.userId].messages.unshift(msg);
      if (!msg.fromAdmin && !msg.isRead) grouped[msg.userId].unreadCount++;
      if (!grouped[msg.userId].lastMessage) grouped[msg.userId].lastMessage = msg;
    }

    return NextResponse.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await prisma.verification.upsert({
      where: { phone },
      update: { code, expiresAt },
      create: { phone, code, expiresAt },
    });

    // In a real app, send via SMS helper.
    // console.log(`[VERIFICATION] Code for ${phone}: ${code}`);

    return NextResponse.json({ 
      message: 'Verification code sent!', 
      // For development purposes, let's keep it easy to test if the user is on localhost
      debugCode: process.env.NODE_ENV === 'development' ? code : undefined 
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}

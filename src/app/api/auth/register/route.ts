import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone, countryCode, password, referralCode, profileImage, name } = await req.json();
    const phone = rawPhone?.trim();

    if (!phone || !countryCode || !password || !name || !profileImage) {
      return NextResponse.json({ error: 'Missing required fields (Registered MoMo Username, Phone, Password, Profile Picture)' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code for the new user
    const newUserReferralCode = `AGRI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        name,
        countryCode,
        password: hashedPassword,
        profileImage: profileImage || null,
        referralCode: newUserReferralCode,
        referredBy: referralCode || null,
        balance: 400.0, // Registration bonus
        registrationBonusClaimed: true,
      },
    });

    // Add bonus transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'BONUS',
        amount: 400.0,
        status: 'SUCCESSFUL',
        notes: 'Registration bonus',
      },
    });

    // Handle referral level logging (optional logic can go here)

    const token = await createToken({ id: user.id, phone: user.phone, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ message: 'User registered successfully', user: { id: user.id, phone: user.phone, balance: user.balance } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

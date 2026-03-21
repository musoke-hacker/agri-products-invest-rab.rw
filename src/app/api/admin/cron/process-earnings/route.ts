import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, addDays, isBefore, differenceInDays } from 'date-fns';

export async function POST() {
  try {
    // 1. Fetch all active investments
    const activeInvestments = await prisma.investment.findMany({
      where: {
        status: 'Active',
      },
      include: {
        product: true,
        user: true,
      },
    });

    let processedCount = 0;
    const now = new Date();

    for (const investment of activeInvestments) {
      const { id, startDate, lastEarningsAt, product, userId } = investment;
      const daysSinceStart = differenceInDays(now, startDate);

      // A. Check if 5-day cycle is completed
      if (daysSinceStart >= 5) {
        // Cycle Complete!
        // Move funds to balance and mark as completed
        await prisma.$transaction([
          prisma.investment.update({
            where: { id },
            data: { status: 'Completed', cycleCount: { increment: 1 } }
          }),
          prisma.user.update({
            where: { id: userId },
            data: { 
              balance: { increment: investment.amount }, // Refund capital? Or just capital+profits?
              // Standard model: Daily income was already added daily. 
              // At the end, we refund the initial capital (investment.amount).
            }
          }),
          prisma.transaction.create({
            data: {
              userId,
              type: 'BONUS',
              amount: investment.amount,
              status: 'SUCCESSFUL',
              notes: `Investment cycle completed: Capital returned for ${product.name}`,
            }
          }),
          prisma.notification.create({
            data: {
              userId,
              message: `Cycle completed for ${product.name}! Your capital of ${investment.amount} RWF has been returned to your wallet.`,
            }
          })
        ]);
        
        // Handle Auto-Reinvest if enabled (optional feature)
        // if (investment.autoReinvest) { ... }
        
        processedCount++;
        continue;
      }

      // B. Daily Earnings Logic
      // If lastEarningsAt was more than 24 hours ago (or in a different day)
      // We'll use startOfDay to ensure earnings are credited once per calendar day
      const lastEarningDay = startOfDay(lastEarningsAt);
      const currentDay = startOfDay(now);

      if (isBefore(lastEarningDay, currentDay)) {
        // Credit daily income
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { 
              balance: { increment: product.dailyIncome },
              totalEarnings: { increment: product.dailyIncome },
              todayEarnings: product.dailyIncome, // Resetting todayEarnings is handled separately usually, but here we set it
            }
          }),
          prisma.transaction.create({
            data: {
              userId,
              type: 'BONUS',
              amount: product.dailyIncome,
              status: 'SUCCESSFUL',
              notes: `Daily earnings for ${product.name}`,
            }
          }),
          prisma.investment.update({
             where: { id },
             data: { lastEarningsAt: now }
          })
        ]);
        processedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${processedCount} investment updates.`,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Earnings processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

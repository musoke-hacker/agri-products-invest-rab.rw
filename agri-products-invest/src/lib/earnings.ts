import { prisma } from './prisma';
import { differenceInDays, addDays, isAfter, startOfDay } from 'date-fns';

export async function updateUserEarnings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { investments: { where: { status: 'Active' }, include: { product: true } } }
  });

  if (!user || user.investments.length === 0) return;

  const now = new Date();
  let totalCommisionToLevels = [];

  for (const inv of user.investments) {
    const daysSinceLastUpdate = differenceInDays(now, inv.lastEarningsAt);

    if (daysSinceLastUpdate >= 1) {
      const dailyIncomePerDay = inv.product.dailyIncome;
      const totalEarningsToAdd = dailyIncomePerDay * daysSinceLastUpdate;

      // Update user balance and earnings
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: totalEarningsToAdd },
          totalEarnings: { increment: totalEarningsToAdd },
          todayEarnings: { set: dailyIncomePerDay } // Simple today earnings
        }
      });

      // Update investment
      const isCycleEnded = isAfter(now, inv.endDate);
      
      await prisma.investment.update({
        where: { id: inv.id },
        data: {
          lastEarningsAt: now,
          status: isCycleEnded ? 'Completed' : 'Active',
          nextEarningsAt: isCycleEnded ? inv.endDate : addDays(now, 1)
        }
      });

      // Handle Referral Commissions
      await handleReferralCommissions(user.id, totalEarningsToAdd);

      // Log Earnings Transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'EARNINGS',
          amount: totalEarningsToAdd,
          status: 'SUCCESSFUL',
          notes: `Daily earnings for ${inv.product.name}`,
        }
      });

      // Handle Auto Reinvest
      if (isCycleEnded && inv.autoReinvest) {
        // Trigger auto-reinvest logic (create new investment)
        const newStartDate = inv.endDate;
        const newEndDate = addDays(newStartDate, 5);
        
        await prisma.$transaction([
          prisma.user.update({
             where: { id: userId },
             data: { balance: { decrement: inv.product.price } }
          }),
          prisma.investment.create({
            data: {
              userId: user.id,
              productId: inv.productId,
              amount: inv.amount,
              startDate: newStartDate,
              endDate: newEndDate,
              nextEarningsAt: addDays(newStartDate, 1),
              status: 'Active',
              cycleCount: inv.cycleCount + 1,
            }
          })
        ]);
      }
    }
  }
}

async function handleReferralCommissions(userId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.referredBy) return;

  // Level 1
  const level1 = await prisma.user.findFirst({ where: { referralCode: user.referredBy } });
  if (level1) {
    const comm1 = amount * 0.10;
    await applyCommission(level1.id, comm1, 'Level 1');

    // Level 2
    if (level1.referredBy) {
      const level2 = await prisma.user.findFirst({ where: { referralCode: level1.referredBy } });
      if (level2) {
        const comm2 = amount * 0.05;
        await applyCommission(level2.id, comm2, 'Level 2');

        // Level 3
        if (level2.referredBy) {
          const level3 = await prisma.user.findFirst({ where: { referralCode: level2.referredBy } });
          if (level3) {
            const comm3 = amount * 0.01;
            await applyCommission(level3.id, comm3, 'Level 3');
          }
        }
      }
    }
  }
}

async function applyCommission(userId: string, amount: number, levelName: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        balance: { increment: amount },
        totalEarnings: { increment: amount }
      }
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: 'REFERRAL',
        amount,
        status: 'SUCCESSFUL',
        notes: `Referral commission (${levelName})`,
      }
    })
  ]);
}

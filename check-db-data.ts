import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const investmentCount = await prisma.investment.count();
  const transactionCount = await prisma.transaction.count();
  
  console.log('--- DATABASE STATUS (AIVEN) ---');
  console.log('Users:', userCount);
  console.log('Products:', productCount);
  console.log('Investments:', investmentCount);
  console.log('Transactions:', transactionCount);
  
  if (userCount > 0) {
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Sample users phones:', users.map(u => u.phone).join(', '));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

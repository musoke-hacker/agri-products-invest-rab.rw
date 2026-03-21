import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing balance and products...');
  
  // 1. Give the main user (admin) and any other users 10,000 to test
  await prisma.user.updateMany({
    data: { balance: 10000.0 }
  });
  console.log('All user balances boosted to 10,000 for testing.');

  // 2. Clear old manual products that were creating duplicates
  // The new seed uses AP1001+, the old ones are like AP101-104
  await prisma.product.deleteMany({
    where: {
      code: {
        in: ['AP101', 'AP102', 'AP103', 'AP104', 'AP201', 'AP202', 'AP203', 'AP204', 'AP301', 'AP302', 'AP303', 'AP304']
      }
    }
  });
  console.log('Old duplicate products removed.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

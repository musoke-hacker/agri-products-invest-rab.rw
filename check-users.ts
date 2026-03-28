import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { phone: true, role: true, balance: true }
  });
  console.log('--- USERS IN DB ---');
  users.forEach(u => console.log(`${u.phone} (${u.role}) - Balance: ${u.balance}`));
  
  const products = await prisma.product.count();
  console.log('Product count:', products);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

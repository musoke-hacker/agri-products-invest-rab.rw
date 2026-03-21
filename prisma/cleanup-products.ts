import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all products whose dailyIncome is NOT exactly 10% of their price
  // These are the old duplicates (e.g. AP101: price=5000, dailyIncome=200 instead of 500)
  const allProducts = await prisma.product.findMany();

  let deleted = 0;
  for (const p of allProducts) {
    const expectedDaily = p.price * 0.1;
    const isCorrect = Math.abs(p.dailyIncome - expectedDaily) < 0.01;
    if (!isCorrect) {
      try {
        // First delete any investments referencing this product
        await prisma.investment.deleteMany({ where: { productId: p.id } });
        await prisma.product.delete({ where: { id: p.id } });
        console.log(`Deleted old product: ${p.code} - ${p.name} (price: ${p.price}, daily: ${p.dailyIncome}, expected: ${expectedDaily})`);
        deleted++;
      } catch (e) {
        console.error(`Failed to delete ${p.code}:`, e);
      }
    }
  }

  console.log(`\nCleanup complete. Removed ${deleted} duplicate/incorrect products.`);
  console.log(`Remaining products: ${allProducts.length - deleted}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

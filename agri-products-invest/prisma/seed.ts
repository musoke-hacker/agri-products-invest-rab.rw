import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { phone: '0795438363' },
    update: {},
    create: {
      phone: '0795438363',
      countryCode: '250',
      password: hashedPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN_AGRI',
    },
  });

  console.log('Admin user created:', admin.phone);

  const products = [
    { code: 'AP101', name: 'Hand Hoe', price: 5000, dailyIncome: 200, cycleIncome: 1000, status: 'Available' },
    { code: 'AP102', name: 'Watering Can', price: 10000, dailyIncome: 450, cycleIncome: 2250, status: 'Hot' },
    { code: 'AP103', name: 'Seed Pack', price: 20000, dailyIncome: 950, cycleIncome: 4750, status: 'Available' },
    { code: 'AP104', name: 'Organic Manure', price: 30000, dailyIncome: 1500, cycleIncome: 7500, status: 'Available' },
    { code: 'AP201', name: 'Fertilizer Pack', price: 50000, dailyIncome: 2600, cycleIncome: 13000, status: 'Hot' },
    { code: 'AP202', name: 'Improved Seeds', price: 100000, dailyIncome: 5500, cycleIncome: 27500, status: 'Available' },
    { code: 'AP203', name: 'Pesticide Tools', price: 150000, dailyIncome: 8500, cycleIncome: 42500, status: 'Available' },
    { code: 'AP204', name: 'Small Irrigation Kit', price: 250000, dailyIncome: 15000, cycleIncome: 75000, status: 'Hot' },
    { code: 'AP301', name: 'Greenhouse Support', price: 40000, dailyIncome: 25000, cycleIncome: 125000, status: 'Available' },
    { code: 'AP302', name: 'Motorized Sprayer', price: 600000, dailyIncome: 40000, cycleIncome: 200000, status: 'Available' },
    { code: 'AP303', name: 'Tractor Sharing Unit', price: 800000, dailyIncome: 55000, cycleIncome: 275000, status: 'Hot' },
    { code: 'AP304', name: 'Commercial Farm Package', price: 1000000, dailyIncome: 75000, cycleIncome: 375000, status: 'Available' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        price: product.price,
        dailyIncome: product.dailyIncome,
        cycleIncome: product.cycleIncome,
        status: product.status,
        image: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80`, // Placeholder
      },
      create: {
        ...product,
        image: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80`, // Placeholder
      },
    });
  }

  console.log('Products seeded');

  // Seed settings
  const settings = [
    { key: 'SMS_CREDIT_BALANCE', value: '1000' },
    { key: 'OFFICIAL_DEPOSIT_NUMBER', value: '+250795438363' },
    { key: 'OFFICIAL_DEPOSIT_NAME', value: 'MUSOKE EDWARD' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Settings seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

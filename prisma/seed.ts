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

  // Clear existing products to prevent duplicates (as per user request)
  await prisma.product.deleteMany({});
  console.log('Old products cleared');

  const baseImages = [
    'https://images.pexels.com/photos/162639/digger-agriculture-machine-farming-162639.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/4505163/pexels-photo-4505163.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/259280/pexels-photo-259280.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/5980/food-sunset-people-field.jpg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/418831/pexels-photo-418831.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2932442/pexels-photo-2932442.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1055068/pexels-photo-1055068.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/316093/pexels-photo-316093.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  const products = [];
  let productCount = 1;
  for (let price = 5000; price <= 1000000; price += 5000) {
    const dailyIncome = price * 0.1;
    const cycleIncome = dailyIncome * 5;
    const imageIndex = (productCount - 1) % baseImages.length;
    
    products.push({
      code: `AP${1000 + productCount}`,
      name: `Agri-Yield Pack Tier ${productCount}`,
      price,
      dailyIncome,
      cycleIncome,
      status: productCount % 5 === 0 ? 'Hot' : 'Available',
      image: baseImages[imageIndex]
    });
    productCount++;
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        price: product.price,
        dailyIncome: product.dailyIncome,
        cycleIncome: product.cycleIncome,
        status: product.status,
        image: product.image,
      },
      create: product,
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

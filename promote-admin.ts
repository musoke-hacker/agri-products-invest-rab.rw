import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '0795438363';
  console.log(`Checking user with phone: ${phone}`);
  
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (user) {
    console.log(`User found. Role: ${user.role}. Updating to ADMIN...`);
    await prisma.user.update({
      where: { phone },
      data: { role: 'ADMIN' }
    });
    console.log('User promoted to ADMIN successfully.');
  } else {
    console.log(`User not found with phone ${phone}. Please register with this phone number first via the login screen.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

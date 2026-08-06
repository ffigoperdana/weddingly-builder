import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';
import { WEDDING_TEMPLATES } from '../src/lib/templates';

const defaultAdminEmail = 'admin@owner.me';
const defaultAdminPassword = 'OwnerAdmin123!';
const defaultUserEmail = 'demo@weddingly.local';
const defaultUserPassword = 'WeddinglyDemo123!';
const isProduction = process.env.NODE_ENV === 'production';
const seedDemoUser = !isProduction || process.env.ALLOW_DEMO_SEED === 'true';

const adminEmail = (
  process.env.SUPER_ADMIN_EMAIL ?? defaultAdminEmail
).trim().toLowerCase();
const adminPassword =
  process.env.SUPER_ADMIN_PASSWORD ?? defaultAdminPassword;
const userEmail = (process.env.SEED_USER_EMAIL ?? defaultUserEmail)
  .trim()
  .toLowerCase();
const userPassword = process.env.SEED_USER_PASSWORD ?? defaultUserPassword;

if (
  !adminEmail ||
  adminPassword.length < 8 ||
  (seedDemoUser && (!userEmail || userPassword.length < 8))
) {
  throw new Error(
    'Seed emails must be present and seed passwords must contain at least 8 characters.',
  );
}

const prisma = new PrismaClient();

try {
  for (const template of WEDDING_TEMPLATES) {
    await prisma.weddingTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        description: template.description,
        rendererId: template.id,
        isActive: true,
      },
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        rendererId: template.id,
      },
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: await hashPassword(adminPassword),
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: await hashPassword(adminPassword),
      role: 'SUPER_ADMIN',
    },
    select: { email: true, role: true },
  });

  console.log(`Seeded local super admin: ${admin.email}`);

  if (seedDemoUser) {
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        password: await hashPassword(userPassword),
        role: 'USER',
        isActive: true,
      },
      create: {
        email: userEmail,
        password: await hashPassword(userPassword),
        role: 'USER',
      },
      select: { email: true, role: true },
    });

    console.log(`Seeded demo user: ${user.email}`);
  } else {
    console.log('Skipped demo user because NODE_ENV=production.');
  }
} finally {
  await prisma.$disconnect();
}

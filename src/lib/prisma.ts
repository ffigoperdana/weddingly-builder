import { PrismaClient } from '@prisma/client';
import { env as runtimeEnv } from 'node:process';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      runtimeEnv.NODE_ENV !== 'production' && import.meta.env.DEV
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (runtimeEnv.NODE_ENV !== 'production' && import.meta.env.DEV) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

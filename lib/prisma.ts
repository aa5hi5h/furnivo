import 'dotenv/config';
let prismaInstance: any = null;

if (typeof globalThis !== 'undefined' && (globalThis as any).prismaInstance) {
  prismaInstance = (globalThis as any).prismaInstance;
} else {
  try {
    const { PrismaClient } = require('./generated/prisma/client');
    prismaInstance = new PrismaClient({});
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).prismaInstance = prismaInstance;
    }
  } catch (error) {
    console.error('Failed to initialize Prisma:', error);
    prismaInstance = {} as any;
  }
}

export const prisma = prismaInstance;
export default prisma;
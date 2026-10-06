import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';

declare global {
  var rhibmsPrisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be set to connect to the database.');
}

const adapter = new PrismaNeonHTTP(connectionString, {});

export const db =
  global.rhibmsPrisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  global.rhibmsPrisma = db;
}
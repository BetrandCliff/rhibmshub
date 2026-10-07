import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';

declare global {
  var rhibmsPrisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be set to connect to the database.');
}

neonConfig.webSocketConstructor = WebSocket;
// Keep ordinary queries stateless across Worker requests; transactions still use WebSockets.
neonConfig.poolQueryViaFetch = true;
const adapter = new PrismaNeon({ connectionString });

export const db =
  global.rhibmsPrisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  global.rhibmsPrisma = db;
}
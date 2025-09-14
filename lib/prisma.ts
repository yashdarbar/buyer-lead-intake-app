import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client instance.
// This is done to prevent creating new instances on every hot reload in development.
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the Prisma client.
const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

export default client;
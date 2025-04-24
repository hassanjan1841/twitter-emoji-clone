import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

/**
 * Type-safe Prisma client creation
 */
const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Define a proper type for the global object
type GlobalWithPrisma = typeof globalThis & {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Cast the global object to our properly typed version
const globalForPrisma = globalThis as GlobalWithPrisma;

// Create a new Prisma client or reuse the existing one
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

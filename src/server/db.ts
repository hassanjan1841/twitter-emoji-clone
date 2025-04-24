import { PrismaClient } from "@prisma/client";
import type { Post as PrismaPost } from "@prisma/client";

import { env } from "~/env";

// Export Post type from Prisma
export type Post = PrismaPost;

/**
 * Type-safe Prisma client creation
 */
const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Define a proper type for the global object
type GlobalWithPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined;
};

// Cast the global object to our properly typed version
const globalForPrisma = globalThis as GlobalWithPrisma;

// Create a new Prisma client or reuse the existing one
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

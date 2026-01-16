// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Adapter usando tu DATABASE_URL del .env (pool de Supabase)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Reutilizar la instancia en desarrollo para evitar múltiples conexiones
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

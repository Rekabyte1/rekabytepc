// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL?.trim();
const DIRECT_URL = process.env.DIRECT_URL?.trim();

if (!DIRECT_URL && !DATABASE_URL) {
  throw new Error(
    "Missing database URL. Set DIRECT_URL (recommended for migrations) or DATABASE_URL."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL for Prisma CLI operations (migrations/db push).
    // Fallback to DATABASE_URL so validate/generate work in environments
    // where only pooled URL is configured.
    url: DIRECT_URL || DATABASE_URL!,
  },
});
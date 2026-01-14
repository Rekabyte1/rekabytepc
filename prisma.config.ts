// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Usamos SIEMPRE la URL directa
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
});

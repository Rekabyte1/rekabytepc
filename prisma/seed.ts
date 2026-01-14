// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { products } from "../data/products"; // productos del archivo data/products.ts

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  console.log("Seeding de productos…");

  // Borra todos los productos actuales
  await prisma.product.deleteMany();
  console.log("Tabla Product limpiada.");

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug }, // usamos el slug como identificador único
      update: {
        name: p.title,
        description: p.desc,
        price: p.price,
        imageUrl: p.image,
        isActive: true,
      },
      create: {
        name: p.title,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        imageUrl: p.image,
        isActive: true,
      },
    });
  }

  console.log("Seed de productos terminado.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {}; // opcional, solo para que TS vea este archivo como módulo

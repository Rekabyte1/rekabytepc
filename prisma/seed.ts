// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { products } from "../data/products";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

type ProductSeed = {
  slug: string;
  title: string;
  desc?: string;
  price: number;
  image?: string;
  stock?: number;

  // opcionales (si los tienes en data/products)
  priceCard?: number;
  priceTransfer?: number;
};

async function main() {
  console.log("Seeding de productos…");

  // ⚠️ IMPORTANTE:
  // NO BORRAMOS la tabla, porque eso te resetea priceCard/priceTransfer a 0 (defaults).
  // Si algún día quieres limpiar TODO, hazlo manual o con un flag.

  for (const raw of products as unknown as ProductSeed[]) {
    const p = raw;

    // Armamos update SIN tocar priceCard/priceTransfer por defecto
    const updateData: any = {
      name: p.title,
      description: p.desc ?? null,
      price: p.price, // si quieres que price "base" se mantenga, déjalo; si no, quítalo
      imageUrl: p.image ?? null,
      stock: p.stock ?? 0,
      isActive: true,
    };

    // Si el seed trae precios finales, los aplicamos; si NO, dejamos los de la BD intactos.
    if (typeof p.priceCard === "number") updateData.priceCard = p.priceCard;
    if (typeof p.priceTransfer === "number") updateData.priceTransfer = p.priceTransfer;

    // En create sí seteamos precios finales (si no vienen, usamos price como fallback)
    const createData: any = {
      name: p.title,
      slug: p.slug,
      description: p.desc ?? null,
      price: p.price,
      priceCard: typeof p.priceCard === "number" ? p.priceCard : p.price,
      priceTransfer: typeof p.priceTransfer === "number" ? p.priceTransfer : p.price,
      imageUrl: p.image ?? null,
      stock: p.stock ?? 0,
      isActive: true,
    };

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: updateData,
      create: createData,
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

export {};

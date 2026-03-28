// prisma/seed.ts
import "dotenv/config";
import { PrismaClient, ProductCategory, ProductKind } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { products } from "../data/products";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  console.log("Seeding de productos...");

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description ?? p.shortDescription ?? null,
        price: p.price,
        priceCard: p.priceCard,
        priceTransfer: p.priceTransfer,
        imageUrl: p.imageUrl ?? null,
        stock: p.stock ?? 0,
        isActive: p.isActive ?? true,

        kind: p.kind as ProductKind,
        category: p.category as ProductCategory,
        subcategory: p.subcategory ?? null,
        brand: p.brand ?? null,
        sku: p.sku ?? null,
        shortDescription: p.shortDescription ?? null,
        specs: p.specs ?? undefined,
        images: p.images ?? [],
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        manufacturerPdfUrl: p.manufacturerPdfUrl ?? null,
        badge: p.badge ?? null,
        featured: p.featured ?? false,
        sortOrder: p.sortOrder ?? 0,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description ?? p.shortDescription ?? null,
        price: p.price,
        priceCard: p.priceCard,
        priceTransfer: p.priceTransfer,
        imageUrl: p.imageUrl ?? null,
        stock: p.stock ?? 0,
        isActive: p.isActive ?? true,

        kind: p.kind as ProductKind,
        category: p.category as ProductCategory,
        subcategory: p.subcategory ?? null,
        brand: p.brand ?? null,
        sku: p.sku ?? null,
        shortDescription: p.shortDescription ?? null,
        specs: p.specs ?? undefined,
        images: p.images ?? [],
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        manufacturerPdfUrl: p.manufacturerPdfUrl ?? null,
        badge: p.badge ?? null,
        featured: p.featured ?? false,
        sortOrder: p.sortOrder ?? 0,
      },
    });
  }

  console.log(`Seed terminado. ${products.length} producto(s) sincronizados.`);
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
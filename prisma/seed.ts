// prisma/seed.ts
import "dotenv/config";
import {
  PrismaClient,
  ProductCategory,
  ProductKind,
  SetupCategory,
  SetupTier,
} from "@prisma/client";
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
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
      select: { id: true, slug: true },
    });

    if (!existing) {
      // 1) Producto nuevo: crear con todos los datos del seed
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description ?? p.shortDescription ?? null,

          price: p.price ?? 0,
          priceCard: p.priceCard ?? 0,
          priceTransfer: p.priceTransfer ?? 0,

          imageUrl: p.imageUrl ?? null,
          images: p.images ?? [],

          stock: p.stock ?? 0,
          isActive: p.isActive ?? true,

          kind: p.kind as ProductKind,
          category: p.category as ProductCategory,
          subcategory: p.subcategory ?? null,
          brand: p.brand ?? null,
          sku: p.sku ?? null,

          setupTier: (p.setupTier as SetupTier | undefined) ?? null,
          setupCategory: (p.setupCategory as SetupCategory | undefined) ?? null,

          shortDescription: p.shortDescription ?? null,
          specs: p.specs ?? undefined,

          seoTitle: p.seoTitle ?? null,
          seoDescription: p.seoDescription ?? null,

          manufacturerPdfUrl: p.manufacturerPdfUrl ?? null,

          badge: p.badge ?? null,
          featured: p.featured ?? false,
          sortOrder: p.sortOrder ?? 0,
        },
      });

      console.log(`Created product: ${p.slug}`);
      continue;
    }

    // 2) Producto existente: actualizar solo campos seguros editoriales/técnicos
    // NO tocar campos comerciales/operativos
    await prisma.product.update({
      where: { slug: p.slug },
      data: {
        name: p.name,

        description: p.description ?? p.shortDescription ?? null,
        shortDescription: p.shortDescription ?? null,

        specs: p.specs ?? undefined,

        imageUrl: p.imageUrl ?? null,
        images: p.images ?? [],

        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        manufacturerPdfUrl: p.manufacturerPdfUrl ?? null,

        brand: p.brand ?? null,
        sku: p.sku ?? null,

        category: p.category as ProductCategory,
        subcategory: p.subcategory ?? null,
        kind: p.kind as ProductKind,
      },
    });

    console.log(`Updated safe fields only: ${p.slug}`);
    console.log(`Skipped commercial fields: ${p.slug}`);
  }

  console.log(`Seed terminado. ${products.length} producto(s) procesados.`);
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
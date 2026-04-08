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
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
      select: { slug: true },
    });

    if (existing) {
      // ============================================
      // 🔒 PRODUCTO EXISTENTE → NO TOCAR DATOS COMERCIALES
      // ============================================
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          // SOLO DATOS TÉCNICOS / ESTRUCTURA

          kind: p.kind as ProductKind,
          category: p.category as ProductCategory,
          subcategory: p.subcategory ?? null,
          brand: p.brand ?? null,
          sku: p.sku ?? null,

          // Puedes decidir si esto lo maneja código o BD
          specs: p.specs ?? undefined,

          // 🔧 IMPORTANTE: estas líneas puedes comentarlas si quieres que la BD mande también en imágenes
          imageUrl: p.imageUrl ?? null,
          images: p.images ?? [],

          manufacturerPdfUrl: p.manufacturerPdfUrl ?? null,
        },
      });
    } else {
      // ============================================
      // 🆕 PRODUCTO NUEVO → CREAR DESDE CÓDIGO
      // ============================================
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
    }
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
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const kind = searchParams.get("kind");
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    const where: any = {
      isActive: true,
    };

    if (slug) where.slug = slug;
    if (kind && Object.values(ProductKind).includes(kind as ProductKind)) {
      where.kind = kind as ProductKind;
    }
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        shortDescription: true,
        imageUrl: true,
        images: true,
        stock: true,
        price: true,
        priceTransfer: true,
        priceCard: true,
        brand: true,
        sku: true,
        kind: true,
        category: true,
        subcategory: true,
        specs: true,
        manufacturerPdfUrl: true,
        badge: true,
        featured: true,
      },
    });

    return NextResponse.json({ ok: true, products }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Error listando productos" },
      { status: 500 }
    );
  }
}
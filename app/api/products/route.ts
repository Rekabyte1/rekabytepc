// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        imageUrl: true,
        stock: true,
        priceTransfer: true,
        priceCard: true,
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

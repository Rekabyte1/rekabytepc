import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slugs: string[] = Array.isArray(body?.slugs) ? body.slugs : [];

    if (!slugs.length) {
      return NextResponse.json({ ok: true, items: [] }, { status: 200 });
    }

    const items = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: {
        slug: true,
        name: true,
        priceTransfer: true,
        priceCard: true,
        stock: true,
        imageUrl: true,
        isActive: true,
      },
    });

    // Normalizamos a lo que consume el front
    const normalized = items.map((p) => ({
      slug: p.slug,
      title: p.name, // 👈 CLAVE: el front usa "title"
      priceTransfer: p.priceTransfer ?? 0,
      priceCard: p.priceCard ?? 0,
      stock: p.stock ?? 0,
      imageUrl: p.imageUrl ?? null,
      isActive: p.isActive ?? true,
    }));

    return NextResponse.json({ ok: true, items: normalized }, { status: 200 });
  } catch (err) {
    console.error("Error en /api/by-slugs:", err);
    return NextResponse.json(
      { ok: false, error: "Error al obtener productos." },
      { status: 500 }
    );
  }
}

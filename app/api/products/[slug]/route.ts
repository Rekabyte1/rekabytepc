// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPriceView } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: any) {
  try {
    // En algunas versiones Next tipa params como Promise<{ slug }>,
    // en otras como { slug }. Esto soporta ambas.
    const rawParams = await (context?.params ?? {});
    const slug =
      (rawParams?.slug ?? context?.params?.slug) as string | undefined;

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Slug requerido", product: null },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        priceCard: true,
        priceTransfer: true,
        stock: true,
        imageUrl: true,
        saleEnabled: true,
        salePercent: true,
        saleStartsAt: true,
        saleEndsAt: true,
        saleLabel: true,
        salePriority: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado", product: null },
        { status: 404 }
      );
    }

    const pricing = buildPriceView(product);

    return NextResponse.json(
      {
        ok: true,
        product: {
          ...product,
          priceTransfer: pricing.transfer.final,
          priceCard: pricing.card.final,
          pricing,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Error en /api/products/[slug]:", err);
    return NextResponse.json(
      { ok: false, error: "Error al obtener producto.", product: null },
      { status: 500 }
    );
  }
}
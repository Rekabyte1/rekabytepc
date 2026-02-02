// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado", product: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        product,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en /api/products/[slug]:", err);
    return NextResponse.json(
      { ok: false, error: "Error al obtener producto.", product: null },
      { status: 500 }
    );
  }
}

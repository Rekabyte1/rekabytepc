// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Slug requerido", product: null },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
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
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
        },
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

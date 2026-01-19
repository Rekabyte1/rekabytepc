// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { slug: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado", product: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, product }, { status: 200 });
  } catch (err: any) {
    console.error("Error en /api/products/[slug]:", err);
    return NextResponse.json(
      { ok: false, error: "Error al obtener producto", product: null },
      { status: 500 }
    );
  }
}

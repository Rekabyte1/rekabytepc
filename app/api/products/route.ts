// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, products });
  } catch (err) {
    console.error("Error cargando productos:", err);
    return NextResponse.json(
      { ok: false, error: "Error cargando productos" },
      { status: 500 }
    );
  }
}

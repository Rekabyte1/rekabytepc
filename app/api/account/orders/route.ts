// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        subtotal: true,
        shippingCost: true,
        paymentMethod: true,
        shippingMethod: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            unitPrice: true,
            quantity: true,
          },
        },
        shipment: {
          select: {
            status: true,
            trackingCode: true,
            pickupLocation: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, orders }, { status: 200 });
  } catch (err) {
    console.error("Error GET /api/account/orders:", err);
    return NextResponse.json(
      { ok: false, error: "Error al cargar pedidos." },
      { status: 500 }
    );
  }
}

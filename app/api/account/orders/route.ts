import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return jsonError("No autorizado.", 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || "10")));

    const [total, orders] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          total: true,
          subtotal: true,
          shippingCost: true,
          paymentMethod: true,
          shippingMethod: true,
          createdAt: true,
          paymentDueAt: true,
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
              type: true,
              status: true,
              trackingCode: true,
              pickupLocation: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        page,
        pageSize,
        total,
        orders,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error GET /api/account/orders:", err);
    return NextResponse.json(
      { ok: false, error: "Error al cargar pedidos." },
      { status: 500 }
    );
  }
}
// app/api/admin/orders/[id]/release/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dispatchStockAlertsForProduct,
  incrementProductStockAndDispatchIfRestocked,
} from "@/lib/stockAlerts";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
type ReleaseTx = {
  order: typeof prisma.order;
  product: typeof prisma.product;
};

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return !!token && !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

function appendNote(prev: string | null | undefined, msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  if (!prev?.trim()) return line;
  return `${prev}\n${line}`;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id: orderId } = await ctx.params;

  try {
    const result = await prisma.$transaction(async (tx: ReleaseTx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        return {
          ok: false as const,
          status: 404 as const,
          error: "Pedido no encontrado.",
        };
      }

      // Ahora aplica tanto a TRANSFER como CARD
      if (order.paymentMethod !== "TRANSFER" && order.paymentMethod !== "CARD") {
        return {
          ok: false as const,
          status: 400 as const,
          error: "Solo puedes liberar reservas de pedidos TRANSFER o CARD.",
        };
      }

      if (order.status !== "PENDING_PAYMENT") {
        return {
          ok: false as const,
          status: 400 as const,
          error: "Solo puedes liberar reservas en pedidos PENDING_PAYMENT.",
        };
      }

      // Candado anti doble liberación
      if (order.stockReleasedAt) {
        return {
          ok: true as const,
          status: 200 as const,
          alreadyReleased: true as const,
        };
      }

      // Si no tiene items, igual cancelamos y marcamos liberado
      if (!order.items?.length) {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            stockReleasedAt: new Date(),
            notes: appendNote(
              order.notes,
              `Reserva liberada manualmente por admin (${order.paymentMethod}) sin items.`
            ),
          },
        });

        return {
          ok: true as const,
          status: 200 as const,
          updated,
        };
      }

      // 1) Devolver stock
      const restockedProductIds = new Set<string>();
      for (const it of order.items) {
        const qty = Number(it.quantity || 0);
        if (qty <= 0) continue;

        const result = await incrementProductStockAndDispatchIfRestocked({
          tx,
          productId: String(it.productId),
          quantity: qty,
        });

        if (result.restocked) restockedProductIds.add(String(it.productId));
      }

      // 2) Cancelar pedido + marcar liberación
      const paymentLabel =
        order.paymentMethod === "TRANSFER"
          ? "transferencia"
          : "tarjeta / Mercado Pago / Webpay";

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          stockReleasedAt: new Date(),
          notes: appendNote(
            order.notes,
            `Reserva liberada manualmente por admin (${paymentLabel}, stock devuelto).`
          ),
        },
      });

      return {
        ok: true as const,
        status: 200 as const,
        updated,
        restockedProductIds: [...restockedProductIds],
      };
    });

    if (result.ok && "restockedProductIds" in result && result.restockedProductIds?.length) {
      const ids = result.restockedProductIds as string[];
      await Promise.all(
        [...new Set(ids)].map((id) =>
          dispatchStockAlertsForProduct(id).catch(() => null)
        )
      );
    }

    return NextResponse.json(result, { status: result.status });
  } catch (e) {
    console.error("[admin][release-reservation] error:", e);
    return NextResponse.json(
      { ok: false, error: "Error liberando la reserva." },
      { status: 500 }
    );
  }
}
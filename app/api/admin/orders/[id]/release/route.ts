// app/api/admin/orders/[id]/release/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function appendNote(prev: string | null | undefined, msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  if (!prev?.trim()) return line;
  return `${prev}\n${line}`;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: orderId } = await ctx.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
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
      for (const it of order.items) {
        const qty = Number(it.quantity || 0);
        if (qty <= 0) continue;

        const product = await tx.product.findUnique({
          where: { id: it.productId },
          select: { id: true, stock: true },
        });

        if (!product) continue;

        const current = typeof product.stock === "number" ? product.stock : 0;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: current + qty,
          },
        });
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
      };
    });

    return NextResponse.json(result, { status: result.status });
  } catch (e) {
    console.error("[admin][release-reservation] error:", e);
    return NextResponse.json(
      { ok: false, error: "Error liberando la reserva." },
      { status: 500 }
    );
  }
}
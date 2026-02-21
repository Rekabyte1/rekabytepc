import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Auth por query param (ideal para Vercel Cron / schedulers externos).
 * - En producción: exige CRON_SECRET sí o sí.
 * - En dev: si no existe CRON_SECRET, permite ejecutar sin auth (conveniente local).
 * - Acepta ?token=... y ?secret=...
 */
function assertCronAuth(req: Request) {
  const secret = process.env.CRON_SECRET;

  // En producción no se permite correr sin secret configurado.
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("CRON_SECRET is not set");
  }

  // En dev, si no está configurado, se deja abierto a propósito.
  if (!secret) return;

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || url.searchParams.get("secret") || "";

  if (token !== secret) throw new Error("Unauthorized");
}

export async function GET(req: Request) {
  try {
    assertCronAuth(req);

    const now = new Date();

    // Buscar órdenes expiradas (TRANSFER + PENDING_PAYMENT + paymentDueAt < now + stockReleasedAt null)
    const expired = await prisma.order.findMany({
      where: {
        paymentMethod: "TRANSFER",
        status: "PENDING_PAYMENT",
        paymentDueAt: { not: null, lt: now },
        stockReleasedAt: null,
      },
      select: { id: true },
      orderBy: { paymentDueAt: "asc" },
      take: 50,
    });

    if (!expired.length) {
      return NextResponse.json({ ok: true, processed: 0, processedIds: [] as string[] });
    }

    let processed = 0;
    const processedIds: string[] = [];

    for (const row of expired) {
      const orderId = row.id;

      const didProcess = await prisma.$transaction(async (tx) => {
        const fresh = await tx.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            status: true,
            paymentDueAt: true,
            stockReleasedAt: true,
            paymentMethod: true,
            items: { select: { productId: true, quantity: true } },
          },
        });

        if (!fresh) return false;
        if (fresh.paymentMethod !== "TRANSFER") return false;
        if (fresh.status !== "PENDING_PAYMENT") return false;
        if (!fresh.paymentDueAt || fresh.paymentDueAt >= now) return false;
        if (fresh.stockReleasedAt) return false;

        // Devolver stock (solo productos con stock != null)
        for (const it of fresh.items) {
          // No asumimos stock: null significa "no trackea stock"
          await tx.product.updateMany({
            where: { id: it.productId, stock: { not: null } },
            data: { stock: { increment: it.quantity } },
          });
        }

        // Cancelar + marcar liberación
        await tx.order.update({
          where: { id: fresh.id },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
            stockReleasedAt: now,
          },
        });

        return true;
      });

      if (didProcess) {
        processed += 1;
        processedIds.push(orderId);
      }
    }

    return NextResponse.json({ ok: true, processed, processedIds });
  } catch (err: any) {
    const msg = String(err?.message ?? "error");
    const isUnauthorized = msg.toLowerCase().includes("unauthorized");
    const isMissingSecret = msg.toLowerCase().includes("cron_secret");
    const status = isUnauthorized ? 401 : isMissingSecret ? 500 : 500;

    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
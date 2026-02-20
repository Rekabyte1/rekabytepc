import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ✅ Auth por query param (ideal para Vercel Cron)
// - Si CRON_SECRET NO está seteado => queda abierto (solo dev).
// - Acepta ?token=... (tu formato actual) y también ?secret=... (por si usas el otro).
function assertCronAuth(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || url.searchParams.get("secret") || "";

  if (token !== secret) throw new Error("Unauthorized");
}

export async function GET(req: Request) {
  try {
    assertCronAuth(req);

    const now = new Date();

    const expired = await prisma.order.findMany({
      where: {
        paymentMethod: "TRANSFER",
        status: "PENDING_PAYMENT",
        paymentDueAt: { not: null, lt: now },
        stockReleasedAt: null,
      },
      select: { id: true },
      take: 50,
    });

    if (!expired.length) {
      return NextResponse.json({ ok: true, processed: 0 });
    }

    let processed = 0;

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

        // ✅ Devolver stock
        for (const it of fresh.items) {
          await tx.product.updateMany({
            where: { id: it.productId, stock: { not: null } },
            data: { stock: { increment: it.quantity } },
          });
        }

        // ✅ Cancelar + marcar liberación
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

      if (didProcess) processed += 1;
    }

    return NextResponse.json({ ok: true, processed });
  } catch (err: any) {
    const msg = String(err?.message ?? "error");
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
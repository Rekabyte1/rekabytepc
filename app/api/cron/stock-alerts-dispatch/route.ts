// app/api/cron/stock-alerts-dispatch/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchStockAlertsForProduct } from "@/lib/stockAlerts";

export const dynamic = "force-dynamic";

function assertCronAuth(req: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    throw new Error("CRON_SECRET no configurado");
  }

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    throw new Error("Unauthorized");
  }
}

export async function GET(req: Request) {
  try {
    assertCronAuth(req);

    const pending = await prisma.stockAlert.findMany({
      where: {
        status: "PENDING",
        product: {
          stock: { gte: 1 },
        },
      },
      select: { productId: true },
      distinct: ["productId"],
      take: 50,
    });

    let processed = 0;

    for (const row of pending) {
      try {
        const result = await dispatchStockAlertsForProduct(row.productId);
        if ((result?.sent ?? 0) > 0) {
          processed += 1;
        }
      } catch {
        // continúa con el siguiente producto
      }
    }

    return NextResponse.json({
      ok: true,
      processed,
    });
  } catch (error: any) {
    const msg = String(error?.message ?? "error");
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: msg,
      },
      { status }
    );
  }
}
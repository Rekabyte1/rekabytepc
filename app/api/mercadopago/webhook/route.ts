import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function appendWebhookNote(prev: string | null | undefined, msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  if (!prev?.trim()) return line;
  return `${prev}\n${line}`;
}

async function fetchMercadoPagoPayment(paymentId: string, accessToken: string) {
  const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok || !data) {
    throw new Error(data?.message || "No se pudo consultar el pago en Mercado Pago.");
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    if (!accessToken) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const url = new URL(req.url);
    const body = await req.json().catch(() => null);

    const topic =
      safeStr(url.searchParams.get("topic")) ||
      safeStr(url.searchParams.get("type")) ||
      safeStr(body?.type);

    const paymentId =
      safeStr(body?.data?.id) ||
      safeStr(body?.id) ||
      safeStr(url.searchParams.get("data.id")) ||
      safeStr(url.searchParams.get("id"));

    if (topic && topic !== "payment") {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const paymentData = await fetchMercadoPagoPayment(paymentId, accessToken);

    const externalReference = safeStr(paymentData?.external_reference);
    if (!externalReference) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const mpStatus = safeStr(paymentData?.status).toLowerCase();
    const transactionId = safeStr(paymentData?.id);
    const amount = Number(paymentData?.transaction_amount || 0);

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: externalReference },
        select: {
          id: true,
          status: true,
          notes: true,
          stockReleasedAt: true,
        },
      });

      if (!order) return;

      await tx.payment.upsert({
        where: { orderId: order.id },
        update: {
          method: "CARD",
          amount,
          transactionId,
          status:
            mpStatus === "approved"
              ? "CONFIRMED"
              : mpStatus === "pending" || mpStatus === "in_process"
              ? "PENDING"
              : "FAILED",
        },
        create: {
          orderId: order.id,
          method: "CARD",
          amount,
          transactionId,
          status:
            mpStatus === "approved"
              ? "CONFIRMED"
              : mpStatus === "pending" || mpStatus === "in_process"
              ? "PENDING"
              : "FAILED",
        },
      });

      if (mpStatus === "approved") {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            notes: appendWebhookNote(
              order.notes,
              `Mercado Pago aprobó el pago (${transactionId || "sin transactionId"}).`
            ),
          },
        });
      }

      if (mpStatus === "rejected" || mpStatus === "cancelled") {
        const fullOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        });

        if (!fullOrder) return;

        if (!fullOrder.stockReleasedAt) {
          for (const item of fullOrder.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { id: true, stock: true },
            });

            if (!product) continue;

            const current = typeof product.stock === "number" ? product.stock : 0;

            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: current + Number(item.quantity || 0),
              },
            });
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            stockReleasedAt: fullOrder.stockReleasedAt ? fullOrder.stockReleasedAt : new Date(),
            notes: appendWebhookNote(
              fullOrder.notes,
              `Mercado Pago devolvió estado ${mpStatus}. Pedido cancelado y stock devuelto automáticamente.`
            ),
          },
        });
      }
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error POST /api/mercadopago/webhook:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
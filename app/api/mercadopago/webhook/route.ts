import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
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
        select: { id: true, status: true },
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
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

function mapPaymentStatus(mpStatus: string): "CONFIRMED" | "PENDING" | "FAILED" {
  if (mpStatus === "approved") return "CONFIRMED";
  if (mpStatus === "pending" || mpStatus === "in_process") return "PENDING";
  return "FAILED";
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

    const externalReference =
      safeStr(paymentData?.external_reference) ||
      safeStr(paymentData?.metadata?.order_id);

    if (!externalReference) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const mpStatus = safeStr(paymentData?.status).toLowerCase();
    const transactionId = safeStr(paymentData?.id);
    const amount = Number(paymentData?.transaction_amount || 0);
    const paymentStatus = mapPaymentStatus(mpStatus);

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: externalReference },
        include: {
          items: true,
          payment: true,
        },
      });

      if (!order) return;

      // 1) Guardar / actualizar payment de forma idempotente
      await tx.payment.upsert({
        where: { orderId: order.id },
        update: {
          method: "CARD",
          amount,
          transactionId: transactionId || order.payment?.transactionId || null,
          status: paymentStatus,
        },
        create: {
          orderId: order.id,
          method: "CARD",
          amount,
          transactionId: transactionId || null,
          status: paymentStatus,
        },
      });

      // 2) Pago aprobado -> pedido pagado automáticamente
      if (mpStatus === "approved") {
        // Si ya está pagado, no sobrescribimos notas innecesariamente
        if (order.status !== "PAID") {
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

        return;
      }

      // 3) Pago pendiente / en proceso -> mantener pendiente
      if (mpStatus === "pending" || mpStatus === "in_process") {
        if (order.status !== "PENDING_PAYMENT") {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "PENDING_PAYMENT",
              notes: appendWebhookNote(
                order.notes,
                `Mercado Pago reportó pago en proceso (${mpStatus}).`
              ),
            },
          });
        }

        return;
      }

      // 4) Pago rechazado / cancelado -> cancelar y devolver stock una sola vez
      if (
        mpStatus === "rejected" ||
        mpStatus === "cancelled" ||
        mpStatus === "refunded" ||
        mpStatus === "charged_back"
      ) {
        // Si ya estaba liberado, no volver a sumar stock
        if (!order.stockReleasedAt) {
          for (const item of order.items) {
            const qty = Number(item.quantity || 0);
            if (qty <= 0) continue;

            const product = await tx.product.findUnique({
              where: { id: item.productId },
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
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancelledAt: order.cancelledAt ?? new Date(),
            stockReleasedAt: order.stockReleasedAt ?? new Date(),
            notes: appendWebhookNote(
              order.notes,
              `Mercado Pago devolvió estado ${mpStatus}. Pedido cancelado${order.stockReleasedAt ? "" : " y stock devuelto automáticamente"}.`
            ),
          },
        });

        return;
      }

      // 5) Otros estados no destructivos: solo dejar registro
      await tx.order.update({
        where: { id: order.id },
        data: {
          notes: appendWebhookNote(
            order.notes,
            `Mercado Pago informó estado no manejado explícitamente: ${mpStatus}.`
          ),
        },
      });
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
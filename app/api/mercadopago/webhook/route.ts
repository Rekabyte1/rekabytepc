// app/api/mercadopago/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import crypto from "crypto";
import {
  dispatchStockAlertsForProduct,
  incrementProductStockAndDispatchIfRestocked,
} from "@/lib/stockAlerts";

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

function isPaidOrBeyond(status: OrderStatus) {
  return (
    status === "PAID" ||
    status === "PREPARING" ||
    status === "SHIPPED" ||
    status === "DELIVERED" ||
    status === "COMPLETED"
  );
}

function parseSignatureHeader(signature: string) {
  const parts = signature.split(",").map((p) => p.trim());
  const map = new Map<string, string>();
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    map.set(key, value);
  }
  return {
    ts: map.get("ts") || "",
    v1: map.get("v1") || "",
  };
}

function isTimestampWithin5Minutes(tsSec: number) {
  if (!Number.isFinite(tsSec)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return Math.abs(nowSec - tsSec) <= 5 * 60;
}

function safeEqualHex(a: string, b: string) {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function buildManifest(params: { dataId: string; requestId: string; ts: string }) {
  return `id:${params.dataId};request-id:${params.requestId};ts:${params.ts};`;
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();

    if (process.env.NODE_ENV === "production" && !webhookSecret) {
      return NextResponse.json({ ok: false, error: "Webhook secret no configurado." }, { status: 401 });
    }

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
    const notificationDataId =
      safeStr(url.searchParams.get("data.id")) || safeStr(body?.data?.id);

    if (topic && topic !== "payment") {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    if (webhookSecret) {
      const signatureHeader = req.headers.get("x-signature")?.trim() || "";
      const requestId = req.headers.get("x-request-id")?.trim() || "";

      if (!signatureHeader || !requestId) {
        return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 401 });
      }

      const { ts, v1 } = parseSignatureHeader(signatureHeader);
      const tsNum = Number(ts);

      if (!ts || !v1 || !isTimestampWithin5Minutes(tsNum)) {
        return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 401 });
      }
      if (!notificationDataId) {
        return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 401 });
      }

      const manifest = buildManifest({
        dataId: notificationDataId.toLowerCase(),
        requestId,
        ts,
      });

      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(manifest)
        .digest("hex");

      if (!safeEqualHex(v1.toLowerCase(), expected.toLowerCase())) {
        return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 401 });
      }
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

    const restockedProductIds = new Set<string>();
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
        if (isPaidOrBeyond(order.status)) {
          return;
        }

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

            const result = await incrementProductStockAndDispatchIfRestocked({
              tx,
              productId: String(item.productId),
              quantity: qty,
            });

            if (result.restocked) restockedProductIds.add(String(item.productId));
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

      // 5) Estado no contemplado: no tocamos stock ni status
      return;
    });

    if (restockedProductIds.size) {
      await Promise.all(
        [...restockedProductIds].map((id) =>
          dispatchStockAlertsForProduct(id).catch(() => null)
        )
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("[MP webhook] error:", error?.message || error);
    return NextResponse.json({ ok: false, error: "Webhook error" }, { status: 500 });
  }
}
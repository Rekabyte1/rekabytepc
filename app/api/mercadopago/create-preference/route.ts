import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function getSiteUrl(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  return req.nextUrl.origin.replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Falta MERCADOPAGO_ACCESS_TOKEN en variables de entorno." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const orderId = safeStr(body?.orderId);

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "Falta orderId." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    if (order.paymentMethod !== "CARD") {
      return NextResponse.json(
        { ok: false, error: "Este pedido no corresponde a Mercado Pago." },
        { status: 400 }
      );
    }

    const siteUrl = getSiteUrl(req);

    const items = order.items.map((item) => ({
      id: item.productId,
      title: item.productName,
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice),
      currency_id: "CLP",
    }));

    if ((order.shippingCost ?? 0) > 0) {
      items.push({
        id: "shipping",
        title: "Costo de envío",
        quantity: 1,
        unit_price: Number(order.shippingCost),
        currency_id: "CLP",
      });
    }

    const preferenceBody = {
      items,
      payer: {
        name: order.contactName,
        email: order.contactEmail,
      },
      external_reference: order.id,
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      back_urls: {
        success: `${siteUrl}/checkout/success?source=mercadopago&status=success&orderId=${encodeURIComponent(order.id)}`,
        pending: `${siteUrl}/checkout/success?source=mercadopago&status=pending&orderId=${encodeURIComponent(order.id)}`,
        failure: `${siteUrl}/checkout/success?source=mercadopago&status=failure&orderId=${encodeURIComponent(order.id)}`,
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" },
          { id: "bank_transfer" },
          { id: "atm" },
        ],
      },
      metadata: {
        order_id: order.id,
        checkout_token: order.checkoutToken ?? null,
      },
      statement_descriptor: "REKABYTE",
    };

    const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResp.json().catch(() => null);

    if (!mpResp.ok || !mpData?.init_point) {
      console.error("Mercado Pago create preference error:", mpData);
      return NextResponse.json(
        {
          ok: false,
          error: mpData?.message || "No se pudo crear la preferencia de Mercado Pago.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point ?? null,
    });
  } catch (error) {
    console.error("Error POST /api/mercadopago/create-preference:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno al crear la preferencia de pago." },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function getSiteUrl(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = envUrl || req.nextUrl.origin;
  return base.replace(/\/+$/, "");
}

function isLocalUrl(url: string) {
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("0.0.0.0")
  );
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
    const isLocal = isLocalUrl(siteUrl);

    const webhookUrl = isLocal
      ? `${siteUrl}/api/mercadopago/webhook`
      : "https://www.rekabyte.cl/api/mercadopago/webhook";

    const items = order.items.map((item) => ({
      id: item.productId,
      title: item.productName,
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice),
      currency_id: "CLP",
    }));

// TEMPORAL DEBUG: no enviar shipping como item a Mercado Pago
// if ((order.shippingCost ?? 0) > 0) {
//   items.push({
//     title: "Costo de envío",
//     quantity: 1,
//     unit_price: Number(order.shippingCost),
//     currency_id: "CLP",
//   } as any);
// }

    const preferenceBody: Record<string, any> = {
      items,
      payer: {
        name: order.contactName || undefined,
        email: order.contactEmail || undefined,
      },
      external_reference: order.id,
      notification_url: webhookUrl,






      metadata: {
        order_id: order.id,
        checkout_token: order.checkoutToken ?? null,
      },
      // statement_descriptor: "REKABYTE",
    };

if (!isLocal) {
  const successUrl = `${siteUrl}/checkout/success?source=mercadopago&status=success&orderId=${encodeURIComponent(order.id)}`;

  const pendingUrl = `${siteUrl}/checkout/success?source=mercadopago&status=pending&orderId=${encodeURIComponent(order.id)}`;

  const failureUrl = `${siteUrl}/checkout/success?source=mercadopago&status=failure&orderId=${encodeURIComponent(order.id)}`;

  preferenceBody.back_urls = {
    success: successUrl,
    pending: pendingUrl,
    failure: failureUrl,
  };

  preferenceBody.redirect_urls = {
    success: successUrl,
    pending: pendingUrl,
    failure: failureUrl,
  };

  preferenceBody.auto_return = "approved";
}

    console.log("[MP create-preference] siteUrl:", siteUrl);
    console.log("[MP create-preference] webhookUrl:", webhookUrl);
    console.log("[MP create-preference] external_reference:", order.id);

    console.log("[MP create-preference] preferenceBody:", JSON.stringify(preferenceBody, null, 2));

    const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceBody),
      cache: "no-store",
    });

    const mpData = await mpResp.json().catch(() => null);

    console.log("[MP create-preference] response:", JSON.stringify(mpData, null, 2));

    if (!mpResp.ok || !mpData?.init_point) {
      console.error("Mercado Pago create preference error:", mpData);

      return NextResponse.json(
        {
          ok: false,
          error:
            mpData?.message ||
            mpData?.cause?.[0]?.description ||
            "No se pudo crear la preferencia de Mercado Pago.",
          mp: mpData ?? null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point ?? null,
      localMode: isLocal,
    });
  } catch (error) {
    console.error("Error POST /api/mercadopago/create-preference:", error);

    return NextResponse.json(
      { ok: false, error: "Error interno al crear la preferencia de pago." },
      { status: 500 }
    );
  }
}
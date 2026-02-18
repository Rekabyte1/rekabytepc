// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderCreatedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type CheckoutPaymentUI = "transferencia" | "webpay" | "mercadopago";

type CheckoutPayload = {
  checkoutToken: string;
  items: { productSlug: string; quantity: number }[];
  customer: { name: string; email: string; phone?: string };
  deliveryType: "pickup" | "shipping";
  paymentMethod: CheckoutPaymentUI;
  address?: {
    fullName?: string;
    phone?: string;
    street: string;
    number?: string;
    apartment?: string;
    commune?: string;
    city: string;
    region: string;
    country?: string;
  };
  notes?: string;
};

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function orderNumberNice(id: string) {
  const clean = String(id || "").trim();
  if (!clean) return "—";
  return "#" + clean.slice(-8).toUpperCase();
}

function normalizePayment(method: CheckoutPaymentUI): "TRANSFER" | "CARD" {
  return method === "transferencia" ? "TRANSFER" : "CARD";
}

function normalizeShipping(deliveryType: "pickup" | "shipping") {
  return deliveryType === "pickup" ? ("PICKUP" as const) : ("DELIVERY" as const);
}

/* ============================================================
   ENVÍO: Tarifa fija por zona (Chilexpress) — backend manda
   - pickup => $0
   - shipping => se calcula por región
   ============================================================ */

type ShippingZone = "RM" | "CENTRO" | "NORTE" | "SUR" | "EXTREMOS" | "UNKNOWN";

function normalizeRegion(regionRaw: string) {
  return safeStr(regionRaw).toLowerCase();
}

function zoneByRegion(regionRaw: string): ShippingZone {
  const r = normalizeRegion(regionRaw);
  if (!r) return "UNKNOWN";

  if (r.includes("metropolitana")) return "RM";

  if (
    r.includes("arica") ||
    r.includes("parinacota") ||
    r.includes("tarapac") ||
    r.includes("antofag") ||
    r.includes("atacama") ||
    r.includes("coquimbo")
  ) {
    return "NORTE";
  }

  if (
    r.includes("valpara") ||
    r.includes("o’higgins") ||
    r.includes("ohiggins") ||
    r.includes("libertador") ||
    r.includes("maule") ||
    r.includes("ñuble") ||
    r.includes("nuble") ||
    r.includes("biob") ||
    r.includes("bío bío") ||
    r.includes("bio bio")
  ) {
    return "CENTRO";
  }

  if (
    r.includes("araucan") ||
    r.includes("los r") ||
    r.includes("ríos") ||
    r.includes("rios") ||
    r.includes("los l") ||
    r.includes("lagos")
  ) {
    return "SUR";
  }

  if (r.includes("ays") || r.includes("magall")) return "EXTREMOS";

  return "UNKNOWN";
}

function shippingCostByZone(zone: ShippingZone) {
  // ✅ AJUSTA ESTOS MONTOS A TU ESTRATEGIA
  switch (zone) {
    case "RM":
      return 6990;
    case "CENTRO":
      return 8990;
    case "NORTE":
      return 10990;
    case "SUR":
      return 10990;
    case "EXTREMOS":
      return 14990;
    default:
      return 11990;
  }
}

function calculateShippingCost(
  deliveryType: "pickup" | "shipping",
  address?: CheckoutPayload["address"]
) {
  if (deliveryType === "pickup") return 0;
  const region = safeStr(address?.region);
  const zone = zoneByRegion(region);
  return shippingCostByZone(zone);
}

/* ============================================================
   EMAIL (idempotente)
   ============================================================ */

async function trySendConfirmationEmailOnce(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: { productName: string; unitPrice: number; quantity: number }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    console.warn("[email] Missing RESEND_API_KEY or RESEND_FROM. Skipping email.");
    return { ok: false as const, skipped: true as const, reason: "missing_env" as const };
  }

  const fresh = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      id: true,
      confirmationEmailSentAt: true,
      createdAt: true,
      total: true,
      subtotal: true,
      shippingCost: true,
      paymentMethod: true,
      shippingMethod: true,
    },
  });

  if (!fresh) {
    console.warn("[email] Order not found when trying to email:", params.orderId);
    return { ok: false as const, skipped: true as const, reason: "order_not_found" as const };
  }

  if (fresh.confirmationEmailSentAt) {
    return { ok: true as const, skipped: true as const, reason: "already_sent" as const };
  }

  const sendRes = await sendOrderCreatedEmail({
    to: params.customerEmail,
    customerName: params.customerName,
    orderId: params.orderId,
    paymentMethod: fresh.paymentMethod,
    shippingMethod: fresh.shippingMethod,
    total: fresh.total,
    subtotal: fresh.subtotal,
    shippingCost: fresh.shippingCost,
    createdAtISO: new Date(fresh.createdAt).toISOString(),
    items: params.items.map((it) => ({
      name: it.productName,
      qty: it.quantity,
      unitPrice: Number(it.unitPrice),
    })),
  });

  const resendId =
    (sendRes.ok && (sendRes.res as any)?.data?.id) ||
    (sendRes.ok && (sendRes.res as any)?.id) ||
    null;

  console.log("[email] sendOrderCreatedEmail result:", {
    orderId: params.orderId,
    ok: sendRes.ok,
    resendId,
    error: !sendRes.ok ? sendRes.error : null,
  });

  if (sendRes.ok) {
    await prisma.order.update({
      where: { id: params.orderId },
      data: { confirmationEmailSentAt: new Date() },
    });
  }

  return sendRes;
}

/* ============================================================
   CHECKOUT
   ============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CheckoutPayload>;

    const checkoutToken = safeStr(body.checkoutToken);
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer ?? ({} as any);
    const deliveryType = body.deliveryType ?? "pickup";
    const paymentMethod = body.paymentMethod ?? "transferencia";
    const address = body.address;
    const notes = body.notes ?? "";

    if (!checkoutToken) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Falta checkoutToken (idempotencia). Actualiza el front para enviar un token estable por intento de compra.",
        },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json({ ok: false, error: "No hay productos en el carrito." }, { status: 400 });
    }

    const customerName = safeStr(customer?.name);
    const customerEmail = safeStr(customer?.email);
    const customerPhone = safeStr(customer?.phone);

    if (!customerName || !customerEmail) {
      return NextResponse.json({ ok: false, error: "Falta nombre o email del cliente." }, { status: 400 });
    }

    // ✅ Shipping: exige street + region + (city o commune)
    if (deliveryType === "shipping") {
      const street = safeStr(address?.street);
      const region = safeStr(address?.region);
      const city = safeStr(address?.city);
      const commune = safeStr(address?.commune);

      if (!street || !region || (!city && !commune)) {
        return NextResponse.json(
          { ok: false, error: "Falta dirección para despacho (calle, región y ciudad/comuna)." },
          { status: 400 }
        );
      }
    }

    const normalizedPaymentMethod = normalizePayment(paymentMethod);
    const payWithCard = normalizedPaymentMethod === "CARD";

    // 1) ✅ Idempotencia
    const existing = await prisma.order.findUnique({
      where: { checkoutToken },
      include: {
        items: { select: { productName: true, unitPrice: true, quantity: true } },
        shipment: true,
      },
    });

    if (existing) {
      try {
        await trySendConfirmationEmailOnce({
          orderId: existing.id,
          customerEmail,
          customerName,
          items: existing.items.map((it) => ({
            productName: it.productName,
            unitPrice: Number(it.unitPrice),
            quantity: Number(it.quantity),
          })),
        });
      } catch (e) {
        console.error("[email] idempotent resend attempt failed:", e);
      }

      return NextResponse.json(
        {
          ok: true,
          orderId: existing.id,
          order: existing,
          shipment: existing.shipment,
          idempotent: true,
        },
        { status: 200 }
      );
    }

    // 2) Validar slugs
    const slugs = items.map((i) => safeStr(i.productSlug)).filter(Boolean);

    if (slugs.length !== items.length) {
      return NextResponse.json({ ok: false, error: "Algún producto no tiene slug válido." }, { status: 400 });
    }

    // 3) Buscar productos
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        price: true,
        priceCard: true,
        priceTransfer: true,
      },
    });

    if (products.length !== slugs.length) {
      return NextResponse.json({ ok: false, error: "Algún producto no existe o fue eliminado." }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.slug, p]));

    // 4) Subtotal + stock
    let subtotal = 0;

    for (const item of items) {
      const slug = safeStr(item.productSlug);
      const product = productMap.get(slug);

      if (!product) {
        return NextResponse.json({ ok: false, error: "Producto no encontrado." }, { status: 400 });
      }

      const quantity = Math.max(1, Number(item.quantity ?? 1));

      if (product.stock != null && product.stock < quantity) {
        return NextResponse.json(
          { ok: false, error: `No hay stock suficiente de ${product.name}.` },
          { status: 400 }
        );
      }

      const unitPrice = payWithCard
        ? (product.priceCard ?? 0) || product.price
        : (product.priceTransfer ?? 0) || product.price;

      subtotal += unitPrice * quantity;
    }

    // 5) ✅ Shipping cost por zona (pickup = 0)
    const shippingCost = calculateShippingCost(deliveryType, address);
    const total = subtotal + shippingCost;

    // 6) Transacción
    const created = await prisma.$transaction(async (tx) => {
      let addressRecord: { id: string } | null = null;

      const shippingMethod = normalizeShipping(deliveryType);

      if (deliveryType === "shipping") {
        // ✅ Fallbacks para NO enviar null donde Prisma exige string
        const streetFinal = safeStr(address?.street);
        const regionFinal = safeStr(address?.region);

        const cityFinal = safeStr(address?.city) || safeStr(address?.commune);
        const communeFinal = safeStr(address?.commune) || safeStr(address?.city);

        addressRecord = await tx.address.create({
          data: {
            userId: null,
            fullName: safeStr(address?.fullName) || customerName,
            phone: safeStr(address?.phone) || customerPhone || "",
            street: streetFinal,
            number: safeStr(address?.number) || "",
            apartment: safeStr(address?.apartment) || "",
            // ✅ IMPORTANTE: NUNCA null (evita Null constraint violation)
            commune: communeFinal || "",
            city: cityFinal || "",
            region: regionFinal,
            country: safeStr(address?.country) || "Chile",
            isDefault: false,
          },
          select: { id: true },
        });
      }

      const order = await tx.order.create({
        data: {
          userId: null,
          contactEmail: customerEmail,
          contactName: customerName,
          contactPhone: customerPhone || null,
          status: "PENDING_PAYMENT",
          shippingMethod,
          paymentMethod: normalizedPaymentMethod,
          shippingCost,
          subtotal,
          total,
          notes: safeStr(notes) || null,
          checkoutToken,
        },
      });

      for (const item of items) {
        const slug = safeStr(item.productSlug);
        const product = productMap.get(slug)!;
        const quantity = Math.max(1, Number(item.quantity ?? 1));

        const unitPrice = payWithCard
          ? (product.priceCard ?? 0) || product.price
          : (product.priceTransfer ?? 0) || product.price;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            unitPrice,
            quantity,
          },
        });

        if (product.stock != null) {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: quantity } },
          });
        }
      }

      let shipment = null;

      if (deliveryType === "shipping" && addressRecord) {
        shipment = await tx.shipment.create({
          data: {
            orderId: order.id,
            addressId: addressRecord.id,
            type: "DELIVERY",
            pickupLocation: null,
          },
        });
      }

      const orderItems = await tx.orderItem.findMany({
        where: { orderId: order.id },
        select: { productName: true, unitPrice: true, quantity: true },
      });

      return { order, shipment, orderItems };
    });

    // 7) Email
    try {
      await trySendConfirmationEmailOnce({
        orderId: created.order.id,
        customerEmail,
        customerName,
        items: created.orderItems.map((it) => ({
          productName: it.productName,
          unitPrice: Number(it.unitPrice),
          quantity: Number(it.quantity),
        })),
      });
    } catch (e) {
      console.error("[email] send attempt failed:", e);
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: created.order.id,
        order: created.order,
        shipment: created.shipment,
        niceOrderNumber: orderNumberNice(created.order.id),
        shippingCost,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const msg = String(err?.message ?? "Error al procesar el pedido.");
    console.error("Error en /api/checkout:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

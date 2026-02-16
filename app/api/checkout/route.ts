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
    return { ok: false as const, skipped: true as const, reason: "missing_env" };
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
      contactName: true,
      contactEmail: true,
    },
  });

  if (!fresh) {
    console.warn("[email] Order not found when trying to email:", params.orderId);
    return { ok: false as const, skipped: true as const, reason: "order_not_found" };
  }

  if (fresh.confirmationEmailSentAt) {
    return { ok: true as const, skipped: true as const, reason: "already_sent" };
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

  console.log("[email] sendOrderCreatedEmail result:", {
    orderId: params.orderId,
    ok: sendRes?.ok,
    skipped: (sendRes as any)?.skipped,
    resendId: (sendRes as any)?.res?.data?.id ?? (sendRes as any)?.res?.id ?? null,
  });

  // Si el lib/email.ts decide “skip”, no marcamos enviado
  if ((sendRes as any)?.skipped) {
    return sendRes;
  }

  // Marcamos enviado solo si intentamos mandar
  await prisma.order.update({
    where: { id: params.orderId },
    data: { confirmationEmailSentAt: new Date() },
  });

  return sendRes;
}

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
      return NextResponse.json(
        { ok: false, error: "No hay productos en el carrito." },
        { status: 400 }
      );
    }

    const customerName = safeStr(customer?.name);
    const customerEmail = safeStr(customer?.email);
    const customerPhone = safeStr(customer?.phone);

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { ok: false, error: "Falta nombre o email del cliente." },
        { status: 400 }
      );
    }

    const normalizedPaymentMethod = normalizePayment(paymentMethod);
    const payWithCard = normalizedPaymentMethod === "CARD";

    // 1) ✅ Idempotencia: si ya existe el pedido para este token, lo devolvemos
    //    PERO: si el email no se envió, lo enviamos 1 vez.
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
    const slugs = items
      .map((i) => safeStr(i.productSlug))
      .filter(Boolean);

    if (slugs.length !== items.length) {
      return NextResponse.json(
        { ok: false, error: "Algún producto no tiene slug válido." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { ok: false, error: "Algún producto no existe o fue eliminado." },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.slug, p]));

    // 4) Calcular subtotal + validar stock
    let subtotal = 0;

    for (const item of items) {
      const slug = safeStr(item.productSlug);
      const product = productMap.get(slug);

      if (!product) {
        return NextResponse.json(
          { ok: false, error: "Producto no encontrado." },
          { status: 400 }
        );
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

    // 5) Shipping cost (si luego lo haces real, cámbialo acá)
    const shippingCost = deliveryType === "shipping" ? 0 : 0;
    const total = subtotal + shippingCost;

    // 6) Transacción
    const created = await prisma.$transaction(async (tx) => {
      let addressRecord: { id: string } | null = null;

      const shippingMethod = normalizeShipping(deliveryType);

      if (deliveryType === "shipping") {
        if (!address?.street || !address?.city || !address?.region) {
          throw new Error("Falta dirección para despacho.");
        }

        addressRecord = await tx.address.create({
          data: {
            userId: null,
            fullName: safeStr(address.fullName) || customerName,
            phone: safeStr(address.phone) || customerPhone || "",
            street: safeStr(address.street),
            number: safeStr(address.number) || "",
            apartment: safeStr(address.apartment) || "",
            commune: safeStr(address.commune) || null,
            city: safeStr(address.city),
            region: safeStr(address.region),
            country: safeStr(address.country) || "Chile",
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

    // 7) ✅ Email + anti reenvío
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
      },
      { status: 201 }
    );
  } catch (err: any) {
    const msg = String(err?.message ?? "Error al procesar el pedido.");
    console.error("Error en /api/checkout:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

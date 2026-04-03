import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderCreatedEmail } from "@/lib/email";
import { DocumentType, ProductCategory, ProductKind } from "@prisma/client";

export const dynamic = "force-dynamic";

type CheckoutPaymentUI = "transferencia" | "webpay" | "mercadopago";
type CheckoutDocumentUI = "boleta" | "factura";

type CheckoutPayload = {
  checkoutToken: string;
  items: { productSlug: string; quantity: number }[];
  customer: { name: string; email: string; phone?: string };
  deliveryType: "pickup" | "shipping";
  paymentMethod: CheckoutPaymentUI;
  documentType?: CheckoutDocumentUI;
  invoiceData?: any;
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

type ShippingZone = "RM" | "NO_EXTREMA" | "EXTREMOS" | "UNKNOWN";
type ComponentShippingSize = "SMALL" | "MEDIUM" | "LARGE" | "XL";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeText(v: unknown) {
  return safeStr(v)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

function normalizeDocumentType(doc?: CheckoutDocumentUI): DocumentType {
  const d = safeStr(doc).toLowerCase();
  return d === "factura" ? DocumentType.FACTURA : DocumentType.BOLETA;
}

function normalizeRegion(regionRaw: string) {
  return safeStr(regionRaw).toLowerCase();
}

function zoneByRegion(regionRaw: string): ShippingZone {
  const r = normalizeRegion(regionRaw);
  if (!r) return "UNKNOWN";

  if (r.includes("metropolitana")) return "RM";

  // Zonas extremas para tu lógica comercial
  if (
  r.includes("arica") ||
  r.includes("parinacota") ||
  r.includes("tarapac") ||
  r.includes("atacama") ||
  r.includes("ays") ||
  r.includes("magall")
) {
  return "EXTREMOS";
}

  return "NO_EXTREMA";
}

function pcShippingPerUnit(zone: ShippingZone, unitSubtotalTransfer: number) {
  if (zone === "EXTREMOS") return 20000;

  if (zone === "RM") {
    return unitSubtotalTransfer > 2_000_000 ? 12000 : 8000;
  }

  return unitSubtotalTransfer > 1_500_000 ? 15000 : 12000;
}

function componentShippingBySize(
  zone: ShippingZone,
  size: ComponentShippingSize
) {
  const table: Record<
    ComponentShippingSize,
    Record<"RM" | "NO_EXTREMA" | "EXTREMOS", number>
  > = {
    SMALL: { RM: 3990, NO_EXTREMA: 5990, EXTREMOS: 7990 },
    MEDIUM: { RM: 4990, NO_EXTREMA: 7990, EXTREMOS: 9990 },
    LARGE: { RM: 6990, NO_EXTREMA: 10990, EXTREMOS: 14990 },
    XL: { RM: 8990, NO_EXTREMA: 13990, EXTREMOS: 17990 },
  };

  const normalizedZone = zone === "UNKNOWN" ? "NO_EXTREMA" : zone;
  return table[size][normalizedZone];
}

function sizeRank(size: ComponentShippingSize) {
  switch (size) {
    case "SMALL":
      return 1;
    case "MEDIUM":
      return 2;
    case "LARGE":
      return 3;
    case "XL":
      return 4;
  }
}

function inferComponentShippingSize(product: {
  category?: ProductCategory | null;
  subcategory?: string | null;
  name?: string | null;
  slug?: string | null;
}): ComponentShippingSize {
  const category = product.category ?? null;
  const sub = normalizeText(product.subcategory);
  const name = normalizeText(product.name);
  const slug = normalizeText(product.slug);

  if (category === ProductCategory.MONITOR) return "XL";

  if (category === ProductCategory.CASE) {
    if (
      sub.includes("micro") ||
      sub.includes("mini") ||
      sub.includes("itx") ||
      sub.includes("matx")
    ) {
      return "LARGE";
    }
    return "XL";
  }

  if (category === ProductCategory.GPU || category === ProductCategory.MOTHERBOARD) {
    return "LARGE";
  }

  if (
    category === ProductCategory.PSU ||
    category === ProductCategory.CPU_COOLER ||
    category === ProductCategory.CASE_FAN
  ) {
    return "MEDIUM";
  }

  if (
    category === ProductCategory.CPU ||
    category === ProductCategory.RAM ||
    category === ProductCategory.STORAGE ||
    category === ProductCategory.THERMAL_PASTE ||
    category === ProductCategory.CABLE
  ) {
    return "SMALL";
  }

  if (
    name.includes("monitor") ||
    slug.includes("monitor") ||
    name.includes("ultrawide")
  ) {
    return "XL";
  }

  if (
    name.includes("gabinete") ||
    slug.includes("gabinete") ||
    slug.includes("case")
  ) {
    if (
      name.includes("mini itx") ||
      name.includes("micro atx") ||
      slug.includes("mini-itx") ||
      slug.includes("micro-atx") ||
      slug.includes("matx")
    ) {
      return "LARGE";
    }
    return "XL";
  }

  if (
    name.includes("gpu") ||
    slug.includes("gpu") ||
    slug.includes("rtx") ||
    slug.includes("rx-")
  ) {
    return "LARGE";
  }

  if (
    name.includes("fuente") ||
    slug.includes("psu") ||
    name.includes("cooler") ||
    name.includes("disipador") ||
    name.includes("ventilador") ||
    name.includes("teclado") ||
    name.includes("audifono") ||
    name.includes("headset") ||
    name.includes("webcam") ||
    name.includes("microfono") ||
    name.includes("mousepad")
  ) {
    return "MEDIUM";
  }

  if (
    name.includes("mouse") ||
    name.includes("ram") ||
    name.includes("ssd") ||
    name.includes("nvme") ||
    name.includes("pasta termica") ||
    slug.includes("mouse") ||
    slug.includes("ram") ||
    slug.includes("ssd") ||
    slug.includes("nvme")
  ) {
    return "SMALL";
  }

  return "MEDIUM";
}

function calculateShippingCost(params: {
  deliveryType: "pickup" | "shipping";
  address?: CheckoutPayload["address"];
  itemsDetailed: Array<{
    quantity: number;
    kind?: ProductKind | null;
    category?: ProductCategory | null;
    subcategory?: string | null;
    name?: string | null;
    slug?: string | null;
    priceTransfer?: number | null;
    price?: number | null;
  }>;
}) {
  const { deliveryType, address, itemsDetailed } = params;

  if (deliveryType === "pickup") return 0;

  const region = safeStr(address?.region);
  const zone = zoneByRegion(region);

  const pcItems = itemsDetailed.filter((p) => p.kind === ProductKind.PREBUILT_PC);
  if (pcItems.length > 0) {
    return pcItems.reduce((acc, item) => {
      const unitSubtotalTransfer = (item.priceTransfer ?? 0) || (item.price ?? 0);
      const perUnit = pcShippingPerUnit(zone, unitSubtotalTransfer);
      return acc + perUnit * item.quantity;
    }, 0);
  }

  const componentUnits = itemsDetailed.reduce((acc, item) => acc + item.quantity, 0);
  if (componentUnits <= 0) return 0;

  const biggestSize = itemsDetailed.reduce<ComponentShippingSize>((max, item) => {
    const current = inferComponentShippingSize(item);
    return sizeRank(current) > sizeRank(max) ? current : max;
  }, "SMALL");

  const perUnit = componentShippingBySize(zone, biggestSize);
  return perUnit * componentUnits;
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
    return {
      ok: false as const,
      skipped: true as const,
      reason: "missing_env" as const,
    };
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
      paymentDueAt: true,
      documentType: true,
      invoiceData: true,
    },
  });

  if (!fresh) {
    console.warn("[email] Order not found when trying to email:", params.orderId);
    return {
      ok: false as const,
      skipped: true as const,
      reason: "order_not_found" as const,
    };
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
    paymentDueAtISO: fresh.paymentDueAt ? new Date(fresh.paymentDueAt).toISOString() : null,
    items: params.items.map((it) => ({
      name: it.productName,
      qty: it.quantity,
      unitPrice: Number(it.unitPrice),
    })),
    documentType: fresh.documentType,
    invoiceData: fresh.invoiceData as any,
  } as any);

  if (sendRes.ok) {
    await prisma.order.update({
      where: { id: params.orderId },
      data: { confirmationEmailSentAt: new Date() },
    });
  }

  return sendRes;
}

export async function POST(req: NextRequest) {
  try {
    const ENABLE_MERCADOPAGO = process.env.ENABLE_MERCADOPAGO === "true";

    const session = await getServerSession(authOptions);
    const checkoutUserId = (session?.user as any)?.id as string | undefined;

    const body = (await req.json()) as Partial<CheckoutPayload>;

    const checkoutToken = safeStr(body.checkoutToken);
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer ?? ({} as any);
    const deliveryType = body.deliveryType ?? "pickup";
    const paymentMethod = body.paymentMethod ?? "transferencia";
    const address = body.address;
    const notes = body.notes ?? "";

    const documentType = normalizeDocumentType(body.documentType);
    const invoiceDataRaw = body.invoiceData ?? null;

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

    if (paymentMethod === "mercadopago" && !ENABLE_MERCADOPAGO) {
      return NextResponse.json(
        { ok: false, error: "Mercado Pago no está disponible por el momento." },
        { status: 400 }
      );
    }

    if (paymentMethod === "webpay") {
      return NextResponse.json(
        { ok: false, error: "Webpay aún no está disponible." },
        { status: 400 }
      );
    }

    if (deliveryType === "shipping") {
      const street = safeStr(address?.street);
      const region = safeStr(address?.region);
      const city = safeStr(address?.city);
      const commune = safeStr(address?.commune);

      if (!street || !region || (!city && !commune)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Falta dirección para despacho (calle, región y ciudad/comuna).",
          },
          { status: 400 }
        );
      }
    }

    if (documentType === DocumentType.FACTURA) {
      const inv: any = invoiceDataRaw || {};
      const razon = safeStr(inv?.razonSocial ?? inv?.razon_social ?? inv?.razon ?? "");
      const rut = safeStr(inv?.rutEmpresa ?? inv?.rut_empresa ?? inv?.rut ?? "");
      if (!razon || !rut) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Si seleccionas FACTURA, debes completar al menos Razón social y RUT empresa.",
          },
          { status: 400 }
        );
      }
    }

    const normalizedPaymentMethod = normalizePayment(paymentMethod);
    const payWithCard = normalizedPaymentMethod === "CARD";

    const paymentDueAt =
      normalizedPaymentMethod === "TRANSFER"
        ? new Date(Date.now() + 2 * 60 * 60 * 1000)
        : null;

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
          paymentDueAt: existing.paymentDueAt
            ? new Date(existing.paymentDueAt).toISOString()
            : null,
        },
        { status: 200 }
      );
    }

    const slugs = items.map((i) => safeStr(i.productSlug)).filter(Boolean);

    if (slugs.length !== items.length) {
      return NextResponse.json(
        { ok: false, error: "Algún producto no tiene slug válido." },
        { status: 400 }
      );
    }

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
        kind: true,
        category: true,
        subcategory: true,
      },
    });

    if (products.length !== slugs.length) {
      return NextResponse.json(
        { ok: false, error: "Algún producto no existe o fue eliminado." },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.slug, p]));

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

    const itemsDetailed = items.map((item) => {
      const slug = safeStr(item.productSlug);
      const product = productMap.get(slug)!;

      return {
        quantity: Math.max(1, Number(item.quantity ?? 1)),
        kind: product.kind,
        category: product.category,
        subcategory: product.subcategory,
        name: product.name,
        slug: product.slug,
        priceTransfer: product.priceTransfer,
        price: product.price,
      };
    });

    const shippingCost = calculateShippingCost({
      deliveryType,
      address,
      itemsDetailed,
    });

    const total = subtotal + shippingCost;

    const created = await prisma.$transaction(async (tx) => {
      let addressRecord: { id: string } | null = null;

      const shippingMethod = normalizeShipping(deliveryType);

      if (deliveryType === "shipping") {
        const streetFinal = safeStr(address?.street);
        const regionFinal = safeStr(address?.region);
        const cityFinal = safeStr(address?.city) || safeStr(address?.commune);
        const communeFinal = safeStr(address?.commune) || safeStr(address?.city);

        addressRecord = await tx.address.create({
          data: {
            userId: checkoutUserId ?? null,
            fullName: safeStr(address?.fullName) || customerName,
            phone: safeStr(address?.phone) || customerPhone || "",
            street: streetFinal,
            number: safeStr(address?.number) || "",
            apartment: safeStr(address?.apartment) || "",
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
          userId: checkoutUserId ?? null,
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
          paymentDueAt,
          documentType,
          invoiceData: documentType === DocumentType.FACTURA ? (invoiceDataRaw as any) : null,
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
          const updated = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });

          if (updated.count !== 1) {
            throw new Error(
              `Stock cambió mientras comprabas: ${product.name}. Intenta nuevamente.`
            );
          }
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
        paymentDueAt: created.order.paymentDueAt
          ? new Date(created.order.paymentDueAt).toISOString()
          : null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const msg = String(err?.message ?? "Error al procesar el pedido.");
    console.error("Error en /api/checkout:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
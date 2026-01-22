// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CheckoutPaymentUI = "transferencia" | "webpay" | "mercadopago";

type CheckoutPayload = {
  // 👇 el frontend enviará el slug del producto
  items: { productSlug: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutPayload;
    const { items, customer, address, deliveryType, notes, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No hay productos en el carrito." },
        { status: 400 }
      );
    }

    // 1) Tomar slugs y validar que ninguno sea undefined / vacío
    const slugs = items
      .map((i) => i.productSlug)
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0);

    if (slugs.length === 0 || slugs.length !== items.length) {
      return NextResponse.json(
        { ok: false, error: "Algún producto no tiene identificador válido (slug)." },
        { status: 400 }
      );
    }

    // 2) Obtener productos desde la BD por slug
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
    });

    if (products.length !== slugs.length) {
      return NextResponse.json(
        { ok: false, error: "Algún producto no existe o fue eliminado." },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.slug, p]));

    // 3) Calcular subtotal y validar stock
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productSlug);
      if (!product) {
        return NextResponse.json(
          { ok: false, error: "Producto no encontrado." },
          { status: 400 }
        );
      }

      const quantity = Number(item.quantity ?? 1);

      if (product.stock != null && product.stock < quantity) {
        return NextResponse.json(
          {
            ok: false,
            error: `No hay stock suficiente de ${product.name}.`,
          },
          { status: 400 }
        );
      }

      subtotal += product.price * quantity;
    }

    // Costo de envío (luego lo podrás mejorar)
    const shippingCost =
      deliveryType === "shipping"
        ? 0 // TODO: lógica real de costo de envío
        : 0;

    const total = subtotal + shippingCost;

    // 4) Normalizar método de pago al enum de tu BD
    const normalizedPaymentMethod =
      paymentMethod === "transferencia" ? "TRANSFER" : "CARD";

    // 5) Transacción: Address + Order + Items + stock + Shipment
    const result = await prisma.$transaction(async (tx) => {
      // 5.1) Address si es envío
      let addressRecord: { id: string } | null = null;

      if (deliveryType === "shipping" && address) {
        addressRecord = await tx.address.create({
          data: {
            userId: "guest", // cambiar cuando tengas usuarios
            fullName: address.fullName ?? customer.name,
            phone: address.phone ?? customer.phone ?? "",
            street: address.street,
            number: address.number ?? "",
            apartment: address.apartment ?? "",
            commune: address.commune ?? "",
            city: address.city,
            region: address.region,
            country: address.country ?? "Chile",
            isDefault: false,
          },
          select: { id: true },
        });
      }

      // 5.2) Order
      const order = await tx.order.create({
        data: {
          userId: null,
          contactEmail: customer.email || "EMPTY",
          contactName: customer.name || "EMPTY",
          contactPhone: customer.phone ?? "EMPTY",
          status: "PENDING_PAYMENT",
          shippingMethod: deliveryType === "pickup" ? "PICKUP" : "DELIVERY",
          paymentMethod: normalizedPaymentMethod,
          shippingCost,
          subtotal,
          total,
          notes: notes ?? "",
        },
      });

      // 5.3) OrderItem + descontar stock
      for (const item of items) {
        const product = productMap.get(item.productSlug)!;
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = product.price;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            unitPrice,
            quantity,
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }

      // 5.4) Shipment si corresponde
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

      return { order, shipment };
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: result.order.id,
        order: result.order,
        shipment: result.shipment,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error en /api/checkout:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Error al procesar el pedido.",
      },
      { status: 500 }
    );
  }
}

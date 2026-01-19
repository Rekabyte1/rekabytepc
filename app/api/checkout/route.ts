// /app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CheckoutItem = {
  productSlug: string;
  quantity: number;
};

type CheckoutPayload = {
  items: CheckoutItem[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  deliveryType: "pickup" | "shipping";
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

    const { items, customer, address, deliveryType, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No hay productos en el carrito." },
        { status: 400 }
      );
    }

    // 1) Obtener productos desde la BD por slug
    const slugs = items.map((i) => i.productSlug);
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

    // 2) Calcular subtotal y validar stock
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

    // Aquí puedes calcular costo de envío real por comuna, etc.
    const shippingCost =
      deliveryType === "shipping"
        ? 0 // TODO: lógica real de costo de envío
        : 0;

    const total = subtotal + shippingCost;

    // 3) Transaction: Address (si corresponde) + Order + OrderItems + stock + Shipment
    const result = await prisma.$transaction(async (tx) => {
      // 3.1) Crear Address si es envío a domicilio
      let addressRecord: { id: string } | null = null;

      if (deliveryType === "shipping" && address) {
        addressRecord = await tx.address.create({
          data: {
            userId: "guest", // TODO: cambiar cuando implementes usuarios
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

      // 3.2) Crear Order
      const order = await tx.order.create({
        data: {
          userId: null, // en el futuro, usuario logueado
          contactEmail: customer.email,
          contactName: customer.name,
          contactPhone: customer.phone ?? "",
          status: "PENDING_PAYMENT", // enum OrderStatus
          shippingMethod: deliveryType === "pickup" ? "PICKUP" : "DELIVERY",
          paymentMethod: "TRANSFER", // por ahora, transferencia
          shippingCost,
          subtotal,
          total,
          notes: notes ?? "",
        },
      });

      // 3.3) Crear OrderItems y descontar stock
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

      // 3.4) Crear Shipment si es envío
      let shipment = null;
      if (deliveryType === "shipping" && addressRecord) {
        shipment = await tx.shipment.create({
          data: {
            orderId: order.id,
            addressId: addressRecord.id,
            type: "DELIVERY", // enum ShippingMethod
            pickupLocation: null,
            // status queda en PENDING por default
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

// app/api/admin/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

// Lista de estados permitidos (solo strings, como antes)
const ALLOWED_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function ensureAdminEnv() {
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.ADMIN_TOKEN
  ) {
    throw new Error(
      "ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_TOKEN no configurados"
    );
  }
}

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return (
    !!token &&
    !!process.env.ADMIN_TOKEN &&
    token === process.env.ADMIN_TOKEN
  );
}

// 👇 Firma compatible con Next 15 / Vercel: params viene como Promise
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    ensureAdminEnv();

    if (!isAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Desempaquetamos el id desde el Promise
    const { id } = await context.params;

    // Body opcional: si algo sale mal, body será null
    const body = await req.json().catch(() => null);

    const rawStatus = (body?.status ?? "") as string;
    const status = rawStatus as AllowedStatus | undefined;
    const noteInternal = (body?.noteInternal as string | undefined) ?? "";

    // Validar estado
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Estado no permitido." },
        { status: 400 }
      );
    }

    // Actualizar pedido en Prisma
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus, // casteo al enum de Prisma
        notes: noteInternal,
      },
      select: {
        id: true,
        status: true,
        notes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        order,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error en PATCH /api/admin/orders/[id]/status:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Error al actualizar el estado del pedido.",
      },
      { status: 500 }
    );
  }
}

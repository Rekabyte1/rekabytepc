// app/api/admin/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { sendOrderStatusUpdateEmail } from "@/lib/resend";

// Lista de estados permitidos
const ALLOWED_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
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
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_TOKEN no configurados");
  }
}

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return !!token && !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

// Next 15 / Vercel: params viene como Promise
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    ensureAdminEnv();

    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await req.json().catch(() => null);

    const rawStatus = (body?.status ?? "") as string;
    const status = rawStatus as AllowedStatus | undefined;

    const noteInternal = String(body?.noteInternal ?? "");
    const sendEmail = Boolean(body?.sendEmail ?? false);

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, error: "Estado no permitido." }, { status: 400 });
    }

    // Traemos el pedido antes (para comparar y para email)
    const prev = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        notes: true,
        contactEmail: true,
        contactName: true,
      },
    });

    if (!prev) {
      return NextResponse.json({ ok: false, error: "Pedido no encontrado." }, { status: 404 });
    }

    // Actualizar en Prisma
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        notes: noteInternal,
      },
      select: {
        id: true,
        status: true,
        notes: true,
        updatedAt: true,
        contactEmail: true,
        contactName: true,
      },
    });

    // Email (opcional)
    let email: { ok: boolean; id?: string; error?: string } | null = null;

    if (sendEmail) {
      const to = String(order.contactEmail || "").trim();

      if (!to) {
        email = { ok: false, error: "El pedido no tiene contactEmail." };
      } else {
        try {
          const res = await sendOrderStatusUpdateEmail({
            to,
            customerName: order.contactName,
            orderId: order.id,
            newStatus: order.status,
            note: order.notes,
          });

          // Resend suele retornar { data: { id }, error }
          const idMaybe =
            (res as any)?.data?.id || (res as any)?.id || undefined;

          email = { ok: true, id: idMaybe };
        } catch (e: any) {
          console.error("[admin-status] error enviando email:", e);
          email = { ok: false, error: e?.message ?? "Error enviando email." };
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        order,
        email,
        prevStatus: prev.status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error en PATCH /api/admin/orders/[id]/status:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Error al actualizar el estado del pedido." },
      { status: 500 }
    );
  }
}

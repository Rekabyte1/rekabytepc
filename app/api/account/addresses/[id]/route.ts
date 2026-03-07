import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function safeStr(v: any) {
  return String(v ?? "").trim();
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) return jsonError("No autenticado.", 401);

    const id = String(ctx.params.id || "").trim();
    if (!id) return jsonError("ID inválido.");

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Body inválido.");

    const fullName = safeStr(body.fullName);
    const phone = safeStr(body.phone);
    const street = safeStr(body.street);
    const number = safeStr(body.number);
    const apartment = safeStr(body.apartment);
    const city = safeStr(body.city);
    const commune = safeStr(body.commune);
    const region = safeStr(body.region);
    const country = safeStr(body.country) || "Chile";
    const makeDefault = Boolean(body.isDefault);

    if (!fullName) return jsonError("Nombre completo es requerido.");
    if (!phone) return jsonError("Teléfono es requerido.");
    if (!street) return jsonError("Calle es requerida.");
    if (!region) return jsonError("Región es requerida.");
    if (!city && !commune) return jsonError("Debes ingresar ciudad o comuna.");

    const updated = await prisma
      .$transaction(async (tx) => {
        const existing = await tx.address.findFirst({
          where: { id, userId },
        });

        if (!existing) throw new Error("NOT_FOUND");

        if (makeDefault) {
          await tx.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          });
        }

        return tx.address.update({
          where: { id },
          data: {
            fullName,
            phone,
            street,
            number: number || null,
            apartment: apartment || null,
            city: city || commune,
            commune: commune || null,
            region,
            country,
            isDefault: makeDefault,
          },
        });
      })
      .catch((e) => {
        if (String(e?.message) === "NOT_FOUND") return null;
        throw e;
      });

    if (!updated) return jsonError("Dirección no encontrada.", 404);

    return NextResponse.json({ ok: true, address: updated });
  } catch (error) {
    console.error("Error PUT /api/account/addresses/[id]:", error);
    return jsonError("Error al actualizar dirección.", 500);
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) return jsonError("No autenticado.", 401);

    const id = String(ctx.params.id || "").trim();
    if (!id) return jsonError("ID inválido.");

    const deleted = await prisma.address.deleteMany({
      where: { id, userId },
    });

    if (!deleted.count) return jsonError("Dirección no encontrada.", 404);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error DELETE /api/account/addresses/[id]:", error);
    return jsonError("Error al eliminar dirección.", 500);
  }
}
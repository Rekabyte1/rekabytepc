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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) return jsonError("No autenticado.", 401);

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }],
    });

    return NextResponse.json({ ok: true, addresses });
  } catch (error) {
    console.error("Error GET /api/account/addresses:", error);
    return jsonError("Error al cargar direcciones.", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) return jsonError("No autenticado.", 401);

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

    const created = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
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
    });

    return NextResponse.json({ ok: true, address: created });
  } catch (error) {
    console.error("Error POST /api/account/addresses:", error);
    return jsonError("Error al crear dirección.", 500);
  }
}
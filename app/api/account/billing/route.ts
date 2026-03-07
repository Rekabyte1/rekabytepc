// app/api/account/billing/route.ts
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
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return jsonError("No autenticado.", 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { billingProfile: true },
  });

  return NextResponse.json({ ok: true, billingProfile: user?.billingProfile ?? null });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return jsonError("No autenticado.", 401);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Body inválido.");

  // Estructura sugerida
  const documentType = safeStr(body.documentType || "BOLETA"); // "BOLETA" | "FACTURA"
  const razonSocial = safeStr(body.razonSocial);
  const rutEmpresa = safeStr(body.rutEmpresa);
  const giro = safeStr(body.giro);
  const address = safeStr(body.address);
  const city = safeStr(body.city);
  const commune = safeStr(body.commune);
  const region = safeStr(body.region);

  if (documentType === "FACTURA") {
    if (!razonSocial) return jsonError("Razón social es requerida para FACTURA.");
    if (!rutEmpresa) return jsonError("RUT empresa es requerido para FACTURA.");
  }

  const billingProfile = {
    documentType,
    razonSocial: razonSocial || null,
    rutEmpresa: rutEmpresa || null,
    giro: giro || null,
    address: address || null,
    city: city || null,
    commune: commune || null,
    region: region || null,
  };

  await prisma.user.update({
    where: { id: userId },
    data: { billingProfile },
  });

  return NextResponse.json({ ok: true, billingProfile });
}
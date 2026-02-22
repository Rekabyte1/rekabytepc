import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ ok: false }, { status: 401 });

  const u = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
      phone: true,
      rut: true,
    },
  });

  if (!u) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({
    ok: true,
    user: {
      id: u.id,
      email: u.email ?? email,
      name: u.name ?? "",
      lastName: u.lastName ?? "",
      phone: u.phone ?? "",
      rut: u.rut ?? "",
    },
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Body inválido" },
      { status: 400 }
    );
  }

  const name = String(body.name ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const rut = String(body.rut ?? "").trim();

  // name: requerido en tu schema (String no nullable)
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "El nombre es obligatorio." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { email },
    data: {
      name,
      lastName: lastName || null,
      phone: phone || null,
      rut: rut || null,
    },
  });

  return NextResponse.json({ ok: true });
}
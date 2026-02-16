// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;

    // obligatorios
    const name = safeStr(body?.name);
    const email = safeStr(body?.email).toLowerCase();
    const password = safeStr(body?.password);

    // opcionales (perfil)
    const lastName = safeStr(body?.lastName) || null;
    const rut = safeStr(body?.rut) || null;
    const phone = safeStr(body?.phone) || null;

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios (nombre, email, contraseña)." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Este correo ya está registrado." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        rut,
        phone,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        rut: true,
        phone: true,
        email: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo crear la cuenta." },
      { status: 500 }
    );
  }
}

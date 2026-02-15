import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

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
        email,
        passwordHash,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("REGISTER_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Error creando usuario." },
      { status: 500 }
    );
  }
}

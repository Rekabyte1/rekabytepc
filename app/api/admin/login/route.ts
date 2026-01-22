import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function POST(req: NextRequest) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_TOKEN) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_TOKEN no configurados");
    return NextResponse.json(
      { ok: false, error: "Configuración de admin incompleta." },
      { status: 500 }
    );
  }

  const { email, password } = await req.json();

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });

    res.cookies.set({
      name: "admin_session",
      value: ADMIN_TOKEN,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return res;
  }

  return NextResponse.json(
    { ok: false, error: "Credenciales inválidas." },
    { status: 401 }
  );
}

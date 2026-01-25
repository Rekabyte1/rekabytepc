import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    ensureAdminEnv();

    const body = await req.json().catch(() => null);
    const email = body?.email as string | undefined;
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos." },
        { status: 400 }
      );
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { ok: false, error: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // Login OK: seteamos cookie de sesión
    const res = NextResponse.json({ ok: true });

    res.cookies.set("admin_token", process.env.ADMIN_TOKEN!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/", // válida para todo el sitio
    });

    return res;
  } catch (err: any) {
    console.error("Error en POST /api/admin/login:", err);
    return NextResponse.json(
      { ok: false, error: "Error al iniciar sesión." },
      { status: 500 }
    );
  }
}

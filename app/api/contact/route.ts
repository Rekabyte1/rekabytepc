import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Body inválido." },
        { status: 400 }
      );
    }

    const name = safeStr(body.name);
    const email = safeStr(body.email);
    const subject = safeStr(body.subject);
    const message = safeStr(body.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Debes completar nombre, correo, asunto y mensaje." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "El correo ingresado no es válido." },
        { status: 400 }
      );
    }

    const result = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "No se pudo enviar el mensaje." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error POST /api/contact:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno al enviar el mensaje." },
      { status: 500 }
    );
  }
}
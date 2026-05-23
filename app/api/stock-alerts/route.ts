// app/api/stock-alerts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, normalizeEmail } from "@/lib/stockAlerts";

const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAP = new Map<string, number>();

function getClientIp(req: Request) {
  const xfwd = req.headers.get("x-forwarded-for");
  if (!xfwd) return "unknown";
  return xfwd.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const last = RATE_LIMIT_MAP.get(ip) ?? 0;

  if (now - last < RATE_LIMIT_WINDOW_MS) {
    return true;
  }

  RATE_LIMIT_MAP.set(ip, now);
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Demasiados intentos. Intenta nuevamente en unos segundos.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const productId = String(body?.productId ?? "").trim();
    const email = normalizeEmail(String(body?.email ?? ""));

    if (!productId) {
      return NextResponse.json(
        { ok: false, error: "productId requerido." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Correo inválido." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    if ((product.stock ?? 0) > 0) {
      return NextResponse.json({
        ok: true,
        message: "Este producto ya tiene stock disponible.",
      });
    }

    await prisma.stockAlert.upsert({
      where: {
        productId_email: {
          productId: product.id,
          email,
        },
      },
      update: {
        status: "PENDING",
        lastError: null,
      },
      create: {
        productId: product.id,
        email,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Te avisaremos cuando vuelva el stock.",
    });
  } catch (error) {
    console.error("POST /api/stock-alerts error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo registrar la alerta. Intenta nuevamente.",
      },
      { status: 500 }
    );
  }
}
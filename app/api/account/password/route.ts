import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function scorePassword(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-ZÁÉÍÓÚÑ]/.test(password)) score += 1;
  if (/[a-záéíóúñ]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password)) score += 1;

  return score;
}

function getPasswordFeedback(password: string) {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lowercase: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    specialChar: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
  };

  const score = scorePassword(password);

  let level: "débil" | "media" | "fuerte" = "débil";
  if (score >= 5) level = "fuerte";
  else if (score >= 3) level = "media";

  return { score, level, checks };
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return jsonError("No autenticado.", 401);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("Body inválido.");
    }

    const currentPassword = String(body.currentPassword ?? "").trim();
    const newPassword = String(body.newPassword ?? "").trim();
    const confirmPassword = String(body.confirmPassword ?? "").trim();

    if (!currentPassword) {
      return jsonError("Debes ingresar tu contraseña actual.");
    }

    if (!newPassword) {
      return jsonError("Debes ingresar una nueva contraseña.");
    }

    if (!confirmPassword) {
      return jsonError("Debes confirmar la nueva contraseña.");
    }

    if (newPassword !== confirmPassword) {
      return jsonError("La confirmación no coincide.");
    }

    if (currentPassword === newPassword) {
      return jsonError("La nueva contraseña no puede ser igual a la actual.");
    }

    const feedback = getPasswordFeedback(newPassword);

    if (!feedback.checks.minLength) {
      return jsonError("La nueva contraseña debe tener al menos 8 caracteres.");
    }

    if (feedback.level === "débil") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La nueva contraseña es demasiado débil. Usa mayúsculas, minúsculas, números y símbolos.",
          passwordFeedback: feedback,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return jsonError("Este usuario no tiene contraseña configurada.", 400);
    }

    const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOk) {
      return jsonError("Contraseña actual incorrecta.", 400);
    }

    const reused = await bcrypt.compare(newPassword, user.passwordHash);
    if (reused) {
      return jsonError("La nueva contraseña no puede ser igual a la actual.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
      passwordFeedback: feedback,
    });
  } catch (error) {
    console.error("Error en /api/account/password:", error);
    return jsonError("Ocurrió un error al actualizar la contraseña.", 500);
  }
}
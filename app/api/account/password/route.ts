// app/api/account/password/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return jsonError("No autenticado.", 401);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Body inválido.");

  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  if (!currentPassword) return jsonError("Debes ingresar tu contraseña actual.");
  if (!newPassword || newPassword.length < 6) return jsonError("La nueva contraseña debe tener al menos 6 caracteres.");
  if (newPassword !== confirmPassword) return jsonError("La confirmación no coincide.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) return jsonError("Este usuario no tiene contraseña configurada.", 400);

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return jsonError("Contraseña actual incorrecta.", 400);

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
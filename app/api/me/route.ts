import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      phone: true,
      rut: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ ok: false, user: null }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: dbUser.id,
      name: dbUser.name ?? "",
      lastName: dbUser.lastName ?? "",
      email: dbUser.email ?? email,
      phone: dbUser.phone ?? "",
      rut: dbUser.rut ?? "",
    },
  });
}
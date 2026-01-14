// app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Consulta simple para verificar que la BD responde
    const result =
      await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    const dbTime = result[0]?.now ?? null;

    return NextResponse.json({
      ok: true,
      dbTime,
    });
  } catch (error) {
    console.error('DB test error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}

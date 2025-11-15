// app/juegos/Tjuegos/page.tsx
// (¡sin 'use client'!)
import { Suspense } from 'react';
import JuegosClient from './JuegosClient'; // mismo folder, export default

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Cargando…</div>}>
      <JuegosClient />
    </Suspense>
  );
}

// Si Vercel siguiera quejándose por prerender, puedes forzar dinámico:
// export const dynamic = 'force-dynamic';

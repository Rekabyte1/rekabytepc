// app/servicios/mantenimiento/page.tsx
export const metadata = {
  title: "Mantenimiento técnico | RekaByte",
  description:
    "Plan Estándar: limpieza de polvo y cambio de pasta térmica. Servicio exclusivo para equipos RekaByte.",
};

export default function MantenimientoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-white">
          Mantenimiento técnico — Plan Estándar
        </h1>
        <p className="mt-2 text-neutral-300">
          Servicio preventivo para mantener tu PC silencioso, fresco y estable.
          <br />
          <span className="text-lime-400 font-semibold">
            Exclusivo para equipos comprados en RekaByte.
          </span>
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <h2 className="mb-4 text-xl font-bold text-white">¿Qué incluye?</h2>
        <ul className="grid gap-3 text-neutral-200">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime-400" />
            Limpieza completa de polvo (interior, ventiladores y filtros).
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime-400" />
            Cambio de pasta térmica del procesador con compuesto de calidad.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime-400" />
            Revisión visual de cables, ventilación y estado general del equipo.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime-400" />
            Pruebas de temperatura y estabilidad posteriores al servicio.
          </li>
        </ul>

        <div className="mt-6 grid items-center gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 text-sm text-neutral-400">
            Tiempo de trabajo estimado: <b className="text-neutral-200">1–2 días hábiles</b>
            <br />
            Entrega en punto de retiro: Real Audiencia 1170, San Miguel.
          </div>

          <div className="flex items-center justify-end gap-2">
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-300"
            >
              Agendar por WhatsApp
            </a>
            <a
              href="/contacto"
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800"
            >
              Contáctanos
            </a>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Nota: Este plan está pensado para mantención preventiva de equipos RekaByte.
          Si tu PC presenta fallas específicas (apaga, no enciende, etc.), escríbenos para
          evaluar un diagnóstico distinto.
        </p>

        <div className="mt-6 h-[3px] w-full rounded-b-2xl bg-lime-400" />
      </section>
    </main>
  );
}

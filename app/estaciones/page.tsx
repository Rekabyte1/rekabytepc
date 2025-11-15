// app/estaciones/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Estaciones de trabajo | RekaByte",
  description:
    "Workstations para diseño, CAD, edición y ciencia de datos. Próximamente en RekaByte.",
};

export default function EstacionesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Estaciones de trabajo
        </h1>
        <p className="mt-3 text-neutral-300 max-w-3xl mx-auto">
          Estamos preparando configuraciones profesionales optimizadas para{" "}
          <strong>diseño</strong>, <strong>edición de foto y video</strong>,{" "}
          <strong>arquitectura / CAD</strong> (AutoCAD, Revit, SolidWorks),
          <strong> modelado y render</strong> (Blender, V-Ray),{" "}
          <strong>audio</strong> y <strong>datos/IA</strong>. 
          Muy pronto podrás elegir tu estación ideal con pruebas reales y soporte post-venta.
        </p>
      </header>

      {/* Próximamente */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="text-xl font-bold text-white mb-3">Próximamente</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            "Diseño gráfico y suites Adobe",
            "Edición de foto y video (Premiere, DaVinci)",
            "Arquitectura / CAD (AutoCAD, Revit, SolidWorks)",
            "3D y Render (Blender, V-Ray, Unreal)",
            "Música / Audio (DAW, plugins, interfaces)",
            "Datos e IA básica (Python, notebooks, GPU)",
          ].map((t) => (
            <li
              key={t}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-neutral-200"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-neutral-400 text-sm">
            ¿Necesitas algo específico antes del lanzamiento? Escríbenos y lo
            preparamos contigo.
          </p>
          <Link
            href="/contacto"
            className="inline-block rounded-xl bg-lime-400 px-4 py-2 font-semibold text-black hover:bg-lime-300"
          >
            Solicitar una cotización
          </Link>
        </div>
      </section>

      {/* Menú rápido (incluye Mantenimiento técnico) */}
      <nav className="mt-8">
        <p className="text-sm font-semibold text-white mb-2">Servicios relacionados</p>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/servicios/mantenimiento"
              className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3.5 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Mantenimiento técnico
            </Link>
          </li>
          <li>
          </li>
        </ul>
      </nav>
    </main>
  );
}

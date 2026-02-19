import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GamingStreamingHomePage() {
  return (
    <main className="rb-container mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
        <p className="text-xs font-extrabold tracking-wide text-neutral-400">
          CATEGORÍA
        </p>

        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">
          Gaming y Streaming
        </h1>

        <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
          Sección en preparación. Por ahora no hay stock publicado, pero pronto iremos
          sumando periféricos, monitores y accesorios de streaming.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl border border-neutral-800 bg-black/20 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
          >
            Volver al inicio
          </Link>

          <Link
            href="/contacto"
            className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-lime-300"
          >
            Consultar disponibilidad
          </Link>
        </div>

        <div className="mt-6 h-[2px] w-full bg-lime-400/80" />
        <p className="mt-3 text-xs text-neutral-500">
          Tip: luego esto se convierte en catálogo con filtros (marca, tipo, etc.).
        </p>
      </div>
    </main>
  );
}

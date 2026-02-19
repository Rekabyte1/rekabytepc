import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string[] };
};

function prettyFromSlug(slug: string[]) {
  const raw = slug
    .map((s) => decodeURIComponent(s))
    .filter(Boolean)
    .join(" / ");

  const title = slug
    .map((s) =>
      decodeURIComponent(s)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase())
    )
    .join(" • ");

  return {
    breadcrumb: raw || "Componentes",
    title: title || "Componentes",
  };
}

export default function ComponentesCatchAllPage({ params }: PageProps) {
  const { slug } = params;
  const info = prettyFromSlug(slug);

  return (
    <main className="rb-container mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <div className="mb-4 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-200">
          Home
        </Link>{" "}
        <span className="mx-1">/</span>
        <Link href="/componentes" className="hover:text-neutral-200">
          Componentes
        </Link>{" "}
        <span className="mx-1">/</span>
        <span className="text-neutral-300">{info.breadcrumb}</span>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
        <p className="text-xs font-extrabold tracking-wide text-neutral-400">
          COMPONENTES
        </p>

        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">
          {info.title}
        </h1>

        <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
          Aún no hay stock publicado en esta categoría. Estamos preparando el catálogo
          y pronto iremos agregando productos.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/componentes"
            className="rounded-xl border border-neutral-800 bg-black/20 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
          >
            Ver todas las categorías
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
          Cuando activemos stock, acá vas a ver listado, filtros y orden.
        </p>
      </div>
    </main>
  );
}

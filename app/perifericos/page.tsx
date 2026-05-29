import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildCatalogProductView } from "@/lib/catalog/attributes";
import { applyFacetFilters, buildFacets } from "@/lib/catalog/facets";
import {
  buildCatalogBreadcrumb,
  decideCanonical,
  parseAndNormalizeFilters,
  serializeFilters,
} from "@/lib/catalog/seo";
import type { CatalogProductView } from "@/lib/catalog/types";

const BASE_URL = "https://www.rekabyte.cl";
const PAGE_PATH = "/perifericos";

// Catálogo general periféricos: filtros útiles y estables
const ALLOWED = new Set(["stock", "brand", "type", "color", "connectivity"]);

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function toSearchParams(input?: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  if (!input) return params;

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      continue;
    }
    if (typeof value === "string" && value.trim()) params.set(key, value);
  }

  return params;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const parsed = parseAndNormalizeFilters(toSearchParams(searchParams));
  const filters = Object.fromEntries(Object.entries(parsed).filter(([k]) => ALLOWED.has(k)));
  const hasQueryFilters = Object.keys(filters).length > 0;

  // Reutilizamos el engine canonical/noindex del family más cercano para conservar comportamiento.
  const canonical = decideCanonical({
    baseUrl: BASE_URL,
    family: "teclados",
    landing: null,
    hasQueryFilters,
    isValidLanding: false,
  });

  // Forzamos canonical base de /perifericos para esta ruta.
  const finalCanonical = `${BASE_URL}${PAGE_PATH}`;

  return {
    title: "Periféricos Gamer en Chile | Teclados, Mouse y Audio - RekaByte",
    description:
      "Compra periféricos gamer en Chile: teclados, mouse, audio y alfombrillas para setup competitivo.",
    robots:
      hasQueryFilters
        ? { index: false, follow: true }
        : { index: true, follow: true },
    alternates: { canonical: finalCanonical },
    openGraph: {
      title: "Periféricos Gamer en Chile | Teclados, Mouse y Audio - RekaByte",
      description:
        "Compra periféricos gamer en Chile: teclados, mouse, audio y alfombrillas para setup competitivo.",
      url: finalCanonical,
    },
    // usamos canonical/index policy final de esta ruta base
    // (canonical calculado por engine se mantiene para consistencia interna si lo necesitas luego)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...(canonical && {}),
  };
}

function toggleFilter(
  filters: Record<string, string[]>,
  key: string,
  value: string,
  single = false
) {
  const current = [...(filters[key] ?? [])];
  const idx = current.indexOf(value);
  let next: string[] = [];

  if (single) {
    next = idx >= 0 ? [] : [value];
  } else {
    if (idx >= 0) current.splice(idx, 1);
    else current.push(value);
    next = current;
  }

  const out: Record<string, string[]> = { ...filters };
  if (next.length) out[key] = next;
  else delete out[key];
  return out;
}

export default async function PerifericosPage({ searchParams }: PageProps) {
  const rawProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      category: "PERIPHERAL",
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      stock: true,
      imageUrl: true,
      priceTransfer: true,
      category: true,
      subcategory: true,
      shortDescription: true,
      description: true,
      specs: true,
      isActive: true,
    },
  });

  const parsed = parseAndNormalizeFilters(toSearchParams(searchParams));
  const filters = Object.fromEntries(Object.entries(parsed).filter(([k]) => ALLOWED.has(k)));
  const hasQueryFilters = Object.keys(filters).length > 0;

  const productViews: CatalogProductView[] = rawProducts.map((p) => buildCatalogProductView(p));

  // Solo families reales solicitadas
  const peripheralViews = productViews.filter((p) =>
    ["teclados", "mouse", "audio", "alfombrillas"].includes(p.family)
  );

  const filteredViews = applyFacetFilters(peripheralViews, filters);

  // Reutilizamos facets de teclado+mouse+audio+alfombrillas para catálogo general
  const facetFamilies = ["teclados", "mouse", "audio", "alfombrillas"] as const;
  const mergedFacetMap = new Map<string, ReturnType<typeof buildFacets>[number]>();

  for (const fam of facetFamilies) {
    const famProducts = peripheralViews.filter((p) => p.family === fam);
    const famFacets = buildFacets(famProducts, fam, filters).filter((f) => ALLOWED.has(f.key));

    for (const facet of famFacets) {
      const key = facet.key;
      if (!mergedFacetMap.has(key)) {
        mergedFacetMap.set(key, { ...facet, options: [...facet.options] });
      } else {
        const current = mergedFacetMap.get(key)!;
        const optionMap = new Map(current.options.map((o) => [o.value, o]));
        for (const opt of facet.options) {
          const existing = optionMap.get(opt.value);
          if (existing) {
            existing.count += opt.count;
            existing.selected = existing.selected || opt.selected;
          } else {
            optionMap.set(opt.value, { ...opt });
          }
        }
        current.options = [...optionMap.values()].sort((a, b) => b.count - a.count);
      }
    }
  }

  const facets = [...mergedFacetMap.values()];

  const breadcrumbs = {
    items: [
      { label: "Home", href: "/" },
      { label: "Periféricos", href: "/perifericos" },
    ],
  };

  // breadcrumbs engine se mantiene para consistencia (no imprescindible aquí)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _engineBreadcrumb = buildCatalogBreadcrumb({ family: "teclados" });

  const activeEntries = Object.entries(filters).filter(([, vals]) => vals.length > 0);
  const clearFiltersHref = PAGE_PATH;

  // counts por familia para mostrar navegación útil
  const counts = {
    teclados: peripheralViews.filter((p) => p.family === "teclados").length,
    mouse: peripheralViews.filter((p) => p.family === "mouse").length,
    audio: peripheralViews.filter((p) => p.family === "audio").length,
    alfombrillas: peripheralViews.filter((p) => p.family === "alfombrillas").length,
  };

  return (
    <main className="rb-container mx-auto max-w-7xl px-3 py-7 text-neutral-100 sm:px-4 sm:py-10">
      <nav className="mb-3 text-xs text-neutral-400 sm:mb-4 sm:text-sm">
        {breadcrumbs.items.map((item, index) => (
          <span key={item.href}>
            {index > 0 ? " / " : ""}
            <Link href={item.href} className="hover:text-lime-300">
              {item.label}
            </Link>
          </span>
        ))}
      </nav>

      <h1 className="text-2xl font-extrabold sm:text-3xl">Periféricos Gamer</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300 sm:mt-3 sm:text-base">
        Explora teclados, mouse, audio y alfombrillas para gaming competitivo y setup premium.
      </p>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/perifericos/teclados"
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-lime-400"
        >
          <h2 className="text-base font-extrabold text-white">Teclados</h2>
          <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{counts.teclados} productos</p>
        </Link>

        <Link
          href="/perifericos/mouse"
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-lime-400"
        >
          <h2 className="text-base font-extrabold text-white">Mouse</h2>
          <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{counts.mouse} productos</p>
        </Link>

        <Link
          href="/perifericos/audio"
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-lime-400"
        >
          <h2 className="text-base font-extrabold text-white">Audio</h2>
          <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{counts.audio} productos</p>
        </Link>

        <Link
          href="/perifericos/alfombrillas"
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-lime-400"
        >
          <h2 className="text-base font-extrabold text-white">Alfombrillas</h2>
          <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{counts.alfombrillas} productos</p>
        </Link>
      </section>

      <div className="sticky top-16 z-30 -mx-3 mt-5 border-y border-neutral-800 bg-neutral-950/95 px-3 py-2 backdrop-blur lg:hidden">
        <details className="group rounded-xl border border-neutral-800 bg-neutral-950/75">
          <summary className="cursor-pointer list-none px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-lime-300">
            Filtros
          </summary>
          <div className="space-y-4 border-t border-neutral-800 px-4 py-4">
            {facets.map((facet) => (
              <details key={facet.key} className="rounded-xl border border-neutral-800 bg-neutral-900/60" open>
                <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-neutral-300">
                  {facet.label}
                </summary>
                <div className="flex flex-wrap gap-2 px-3 pb-3">
                  {facet.options.map((opt) => {
                    const nextFilters = toggleFilter(filters, facet.key, opt.value, facet.selectionMode === "single");
                    const qs = serializeFilters(nextFilters);
                    return (
                      <Link
                        key={`mobile-${facet.key}-${opt.value}`}
                        href={qs ? `${PAGE_PATH}?${qs}` : PAGE_PATH}
                        className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                          opt.selected
                            ? "border-lime-300 bg-lime-400/20 text-lime-200"
                            : "border-neutral-700 bg-black/20 text-neutral-300 hover:border-lime-400/40"
                        }`}
                      >
                        {opt.swatchHex ? (
                          <span
                            className="mr-1.5 inline-block h-3 w-3 rounded-full border border-neutral-600"
                            style={{ backgroundColor: opt.swatchHex }}
                          />
                        ) : null}
                        {opt.label} ({opt.count})
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </details>
      </div>

      <div className="mt-5 grid gap-6 lg:mt-2 lg:gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="sticky top-24 hidden h-fit rounded-2xl border border-neutral-800 bg-neutral-950/65 p-5 lg:block">
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-lime-300">Filtros</h2>
          <div className="space-y-4">
            {facets.map((facet) => (
              <details key={facet.key} className="group rounded-xl border border-neutral-800 bg-neutral-900/60" open>
                <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-wide text-neutral-300 group-open:text-neutral-100">
                  {facet.label}
                </summary>
                <div className="flex flex-wrap gap-2 px-3 pb-3">
                  {facet.options.map((opt) => {
                    const nextFilters = toggleFilter(filters, facet.key, opt.value, facet.selectionMode === "single");
                    const qs = serializeFilters(nextFilters);
                    return (
                      <Link
                        key={`${facet.key}-${opt.value}`}
                        href={qs ? `${PAGE_PATH}?${qs}` : PAGE_PATH}
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                          opt.selected
                            ? "border-lime-300 bg-lime-400/20 text-lime-200"
                            : "border-neutral-700 bg-black/20 text-neutral-300 hover:border-lime-400/40 hover:text-neutral-100"
                        }`}
                      >
                        {opt.swatchHex ? (
                          <span
                            className="mr-1.5 inline-block h-3 w-3 rounded-full border border-neutral-600"
                            style={{ backgroundColor: opt.swatchHex }}
                          />
                        ) : null}
                        {opt.label} ({opt.count})
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2 overflow-hidden">
            {activeEntries.map(([key, values]) =>
              values.map((value) => {
                const next = toggleFilter(filters, key, value, key === "stock");
                const qs = serializeFilters(next);
                return (
                  <Link
                    key={`chip-${key}-${value}`}
                    href={qs ? `${PAGE_PATH}?${qs}` : PAGE_PATH}
                    className="inline-flex max-w-full items-center rounded-full border border-lime-400/40 bg-lime-400/15 px-2.5 py-1 text-[11px] font-bold text-lime-200 sm:px-3 sm:text-xs"
                  >
                    <span className="truncate">
                      {key}: {value}
                    </span>
                    <span className="ml-2 shrink-0 text-lime-100">×</span>
                  </Link>
                );
              })
            )}
            {activeEntries.length ? (
              <Link
                href={clearFiltersHref}
                className="inline-flex items-center rounded-full border border-neutral-700 bg-black/20 px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:border-lime-400/40 hover:text-lime-200 sm:px-3 sm:text-xs"
              >
                Limpiar filtros
              </Link>
            ) : null}
          </div>

          <div className="mb-4 text-xs text-neutral-400 sm:mb-5 sm:text-sm">
            Mostrando {filteredViews.length} de {peripheralViews.length} productos
          </div>

          {filteredViews.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 text-center">
              <p className="text-lg font-extrabold text-white">No encontramos resultados con esos filtros.</p>
              <p className="mt-2 text-sm text-neutral-400">
                Prueba removiendo algunos filtros para ver más periféricos.
              </p>
              <Link
                href={clearFiltersHref}
                className="mt-4 inline-flex items-center rounded-full border border-lime-400/40 bg-lime-400/15 px-4 py-2 text-sm font-bold text-lime-200 hover:bg-lime-400/20"
              >
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredViews.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.slug}`}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 p-3.5 transition hover:-translate-y-0.5 hover:border-lime-400 sm:p-4"
                >
                  <img
                    src={p.imageUrl || "/placeholder.jpg"}
                    alt={p.name}
                    className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
                  />
                  {p.brand ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 sm:text-xs">
                      {p.brand}
                    </p>
                  ) : null}
                  <h2 className="line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base">{p.name}</h2>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-lime-300 sm:text-base">
                      {(p.priceTransfer ?? 0).toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })}
                    </span>
                    <span
                      className={`text-[11px] font-bold sm:text-xs ${
                        p.isInStock ? "text-lime-300" : "text-red-400"
                      }`}
                    >
                      {p.isInStock ? "En stock" : "Sin stock"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
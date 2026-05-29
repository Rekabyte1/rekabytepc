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
import { PerifericosFamilyTabs } from "@/components/PerifericosFamilyTabs";

const BASE_URL = "https://www.rekabyte.cl";
const PAGE_PATH = "/perifericos/teclados";

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
  const filters = parseAndNormalizeFilters(toSearchParams(searchParams));
  const hasQueryFilters = Object.keys(filters).length > 0;
  const canonical = decideCanonical({
    baseUrl: BASE_URL,
    family: "teclados",
    landing: null,
    hasQueryFilters,
    isValidLanding: false,
  });

  return {
    title: "Teclados Gamer en Chile | Mecánicos y Magnéticos - RekaByte",
    description:
      "Compra teclados gamer en Chile: modelos mecánicos, magnéticos, compactos, RGB y opciones para gaming competitivo.",
    robots:
      canonical.indexPolicy === "index"
        ? { index: true, follow: true }
        : { index: false, follow: true },
    alternates: { canonical: canonical.canonicalUrl },
    openGraph: {
      title: "Teclados Gamer en Chile | Mecánicos y Magnéticos - RekaByte",
      description:
        "Compra teclados gamer en Chile: modelos mecánicos, magnéticos, compactos, RGB y opciones para gaming competitivo.",
      url: canonical.canonicalUrl,
    },
  };
}

function toggleFilter(filters: Record<string, string[]>, key: string, value: string, single = false) {
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

export default async function TecladosPage({ searchParams }: PageProps) {
  const rawProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      category: "PERIPHERAL",
      OR: [
        { subcategory: { in: ["KEYBOARD", "COMBO", "KIT", "KEYBOARD_MOUSE_COMBO"] } },
        { name: { contains: "teclado", mode: "insensitive" } },
      ],
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

  const filters = parseAndNormalizeFilters(toSearchParams(searchParams));
  const hasQueryFilters = Object.keys(filters).length > 0;

  const productViews: CatalogProductView[] = rawProducts.map((p) => buildCatalogProductView(p));
  const keyboardViews = productViews.filter((p: CatalogProductView) => p.family === "teclados");
  const filteredViews = applyFacetFilters(keyboardViews, filters);
  const facets = buildFacets(keyboardViews, "teclados", filters);
  const canonical = decideCanonical({
    baseUrl: BASE_URL,
    family: "teclados",
    landing: null,
    hasQueryFilters,
    isValidLanding: false,
  });
  const breadcrumbs = buildCatalogBreadcrumb({ family: "teclados" });
  const activeEntries = Object.entries(filters).filter(([, vals]) => vals.length > 0);
  const clearFiltersHref = PAGE_PATH;

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

      <h1 className="text-2xl font-extrabold sm:text-3xl">Teclados Gamer</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300 sm:mt-3 sm:text-base">
        Explora teclados gamer mecánicos y magnéticos para FPS competitivo, uso diario y setups premium.
      </p>

      <PerifericosFamilyTabs active="teclados" />

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
                    const nextFilters = toggleFilter(
                      filters,
                      facet.key,
                      opt.value,
                      facet.selectionMode === "single"
                    );
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
                const nextFilters = toggleFilter(filters, key, value, key === "stock");
                const qs = serializeFilters(nextFilters);
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
            Mostrando {filteredViews.length} de {keyboardViews.length} productos
          </div>

          {filteredViews.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 text-center">
              <p className="text-lg font-extrabold text-white">No encontramos resultados con esos filtros.</p>
              <p className="mt-2 text-sm text-neutral-400">
                Ajusta filtros o vuelve a todos los teclados.
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
                  <h2 className="line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base">
                    {p.name}
                  </h2>
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

      <link rel="canonical" href={canonical.canonicalUrl} />
    </main>
  );
}
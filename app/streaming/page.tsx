import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.rekabyte.cl";
const PAGE_PATH = "/streaming";
const TITLE = "Accesorios de Streaming en Chile | Micrófonos y Setup - RekaByte";
const DESCRIPTION =
  "Accesorios de streaming en Chile para creadores: micrófonos, soportes, audio y productos para mejorar tu setup.";

type StreamingProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  stock: number | null;
  imageUrl: string | null;
  priceTransfer: number | null;
  shortDescription: string | null;
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Streaming", href: PAGE_PATH },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}${PAGE_PATH}`,
  },
};

function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`;
}

function formatPrice(price: number | null) {
  return (price ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
  });
}

function buildBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

function buildItemListJsonLd(products: StreamingProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: absoluteUrl(PAGE_PATH),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/producto/${product.slug}`),
    })),
  };
}

export default async function StreamingPage() {
  const products: StreamingProduct[] = await prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      category: "STREAMING",
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
      shortDescription: true,
    },
  });

  return (
    <main className="rb-container mx-auto max-w-7xl px-3 py-7 text-neutral-100 sm:px-4 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(products)) }}
      />

      <nav className="mb-3 text-xs text-neutral-400 sm:mb-4 sm:text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((item, index) => (
          <span key={item.href}>
            {index > 0 ? " / " : ""}
            <Link href={item.href} className="hover:text-lime-300">
              {item.label}
            </Link>
          </span>
        ))}
      </nav>

      <section className="overflow-hidden rounded-3xl border border-lime-400/20 bg-gradient-to-br from-lime-400/10 via-neutral-950 to-neutral-950 p-5 shadow-2xl shadow-black/30 sm:p-7 lg:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-lime-300">Creadores / Setup / Audio</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Streaming</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-300 sm:text-base">
            Mejora tu setup de creación con accesorios de streaming seleccionados para lograr audio más claro, una
            presencia más profesional y una experiencia consistente en directos, videollamadas y contenido grabado.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-neutral-300">
          <span className="rounded-full border border-neutral-800 bg-black/25 px-3 py-1.5">Micrófonos</span>
          <span className="rounded-full border border-neutral-800 bg-black/25 px-3 py-1.5">Audio para creadores</span>
          <span className="rounded-full border border-neutral-800 bg-black/25 px-3 py-1.5">Setup premium</span>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-lime-300">Catálogo Streaming</p>
            <h2 className="mt-1 text-2xl font-extrabold text-white">Productos para creadores</h2>
          </div>
          <p className="text-sm text-neutral-400">
            {products.length === 1 ? "1 producto disponible" : `${products.length} productos disponibles`}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 text-center sm:p-10">
            <p className="text-lg font-extrabold text-white">Pronto tendremos productos de streaming disponibles.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-400">
              Estamos preparando una selección de micrófonos y accesorios para creadores. Mientras tanto, puedes revisar
              periféricos de audio gamer disponibles en RekaByte.
            </p>
            <Link
              href="/perifericos/audio"
              className="mt-5 inline-flex items-center rounded-full border border-lime-400/40 bg-lime-400/15 px-4 py-2 text-sm font-bold text-lime-200 transition hover:bg-lime-400/20"
            >
              Ver audio gamer
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const isInStock = (product.stock ?? 0) > 0;

              return (
                <Link
                  key={product.id}
                  href={`/producto/${product.slug}`}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 transition hover:-translate-y-0.5 hover:border-lime-400/70 hover:bg-neutral-900 sm:p-4"
                >
                  <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black/25">
                    <img
                      src={product.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="mt-3 min-h-[92px]">
                    {product.brand ? (
                      <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 sm:text-xs">
                        {product.brand}
                      </p>
                    ) : null}
                    <h2 className="mt-1 line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-base">
                      {product.name}
                    </h2>
                    {product.shortDescription ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-400">{product.shortDescription}</p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-800 pt-3">
                    <span className="text-sm font-extrabold text-lime-300 sm:text-base">
                      {formatPrice(product.priceTransfer)}
                    </span>
                    <span className={`text-[11px] font-bold sm:text-xs ${isInStock ? "text-lime-300" : "text-red-400"}`}>
                      {isInStock ? "En stock" : "Sin stock"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
          <h2 className="text-lg font-extrabold text-white">Audio claro para contenido</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-300">
            Un buen micrófono ayuda a que tus transmisiones, reels, podcasts y videollamadas se sientan más limpias y
            profesionales desde el primer minuto.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
          <h2 className="text-lg font-extrabold text-white">Setup ordenado y funcional</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-300">
            Elige accesorios pensados para escritorio, control de ruido y comodidad diaria, sin perder la estética gamer
            premium del setup.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
          <h2 className="text-lg font-extrabold text-white">Complementa tu periférico ideal</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-300">
            Combina streaming con periféricos de audio, teclados y mouse para crear una estación completa para jugar,
            trabajar y crear contenido.
          </p>
        </article>
      </section>
    </main>
  );
}
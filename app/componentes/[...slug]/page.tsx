import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

type Filters = {
  category?: string;
  subcategory?: string;
  brand?: string;
};

function formatTitlePart(value: string) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function prettyFromSlug(slug: string[]) {
  const raw = slug.map((s) => decodeURIComponent(s)).filter(Boolean).join(" / ");
  const title = slug.map((s) => formatTitlePart(s)).join(" • ");

  return {
    breadcrumb: raw || "Componentes",
    title: title || "Componentes",
  };
}

function resolveFilters(slug: string[]): Filters {
  const [group, subtype, detail] = slug;

  if (!group) return {};

  if (group === "procesador") {
    return {
      category: "CPU",
      brand:
        subtype === "intel" ? "INTEL" : subtype === "amd" ? "AMD" : undefined,
    };
  }

  if (group === "placa-madre") {
    return {
      category: "MOTHERBOARD",
      brand:
        subtype === "intel" ? "INTEL" : subtype === "amd" ? "AMD" : undefined,
    };
  }

  if (group === "ram") {
    return { category: "RAM" };
  }

  if (group === "almacenamiento") {
    return { category: "STORAGE" };
  }

  if (group === "gpu") {
    return {
      category: "GPU",
      brand:
        subtype === "nvidia"
          ? "NVIDIA"
          : subtype === "amd"
          ? "AMD"
          : subtype === "intel"
          ? "INTEL"
          : undefined,
    };
  }

  if (group === "refrigeracion") {
    if (subtype === "liquida") return { category: "CPU_COOLER", subcategory: "LIQUIDA" };
    if (subtype === "disipador-cpu") return { category: "CPU_COOLER", subcategory: "AIRE" };
    if (subtype === "ventilador-gabinete") return { category: "CASE_FAN" };
    if (subtype === "pasta-termica") return { category: "THERMAL_PASTE" };
  }

  if (group === "fuente-poder") {
    if (subtype === "fuentes") return { category: "PSU" };
    if (subtype === "cables") return { category: "CABLE" };
  }

  if (group === "gabinetes") {
    if (subtype === "full-mid-tower") {
      return { category: "CASE", subcategory: "FULL_MID_TOWER" };
    }
    if (subtype === "matx-mini-itx") {
      return { category: "CASE", subcategory: "MICRO_ATX_MINI_ITX" };
    }
    return { category: "CASE" };
  }

  // fallback más abierto
  if (detail) {
    return {};
  }

  return {};
}

export default async function ComponentesCatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const info = prettyFromSlug(slug);
  const filters = resolveFilters(slug);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      ...(filters.category ? { category: filters.category as any } : {}),
      ...(filters.subcategory ? { subcategory: filters.subcategory } : {}),
      ...(filters.brand ? { brand: { equals: filters.brand, mode: "insensitive" } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      priceTransfer: true,
      stock: true,
      brand: true,
      shortDescription: true,
    },
  });

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

      <div className="mb-6">
        <p className="text-xs font-extrabold tracking-wide text-neutral-400">
          COMPONENTES
        </p>

        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">
          {info.title}
        </h1>

        {products.length > 0 ? (
          <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
            Mostrando {products.length} producto{products.length === 1 ? "" : "s"} en esta categoría.
          </p>
        ) : (
          <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
            Aún no hay stock publicado en esta categoría. Estamos preparando el catálogo
            y pronto iremos agregando productos.
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-lime-400 transition"
            >
              <img
                src={p.imageUrl || "/placeholder.jpg"}
                alt={p.name}
                className="w-full h-48 object-cover rounded-md mb-3"
              />

              {p.brand ? (
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                  {p.brand}
                </p>
              ) : null}

              <h2 className="mt-1 font-bold text-white">{p.name}</h2>

              {p.shortDescription ? (
                <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                  {p.shortDescription}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-lime-400">
                  {p.priceTransfer?.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </p>

                {typeof p.stock === "number" && p.stock > 0 ? (
                  <span className="text-xs font-bold text-lime-300">
                    Stock: {p.stock}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-400">Sin stock</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
          <div className="mt-2 flex flex-wrap gap-3">
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
      )}
    </main>
  );
}
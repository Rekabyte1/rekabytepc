import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    breadcrumb: raw || "Gaming y Streaming",
    title: title || "Gaming y Streaming",
  };
}

function resolveGamingStreamingFilter(slug: string[]) {
  const path = slug.map((s) => decodeURIComponent(s).toLowerCase());
  const joined = path.join("/");

  if (joined === "perifericos" || joined.startsWith("perifericos/")) {
    if (joined.includes("/audifonos")) {
      return {
        categories: ["PERIPHERAL"],
        subcategories: ["HEADSET", "AUDIO"],
      };
    }

    if (joined.includes("/mouse")) {
      return {
        categories: ["PERIPHERAL"],
        subcategories: ["MOUSE"],
      };
    }

    if (joined.includes("/mousepad")) {
      return {
        categories: ["PERIPHERAL"],
        subcategories: ["MOUSEPAD"],
      };
    }

    if (joined.includes("/teclado")) {
      return {
        categories: ["PERIPHERAL"],
        subcategories: ["KEYBOARD"],
      };
    }

    if (joined.includes("/kit-teclado-mouse")) {
      return {
        categories: ["PERIPHERAL"],
        subcategories: ["COMBO", "KIT", "KEYBOARD_MOUSE_COMBO"],
      };
    }

    return {
      categories: ["PERIPHERAL"],
      subcategories: [],
    };
  }

  if (joined === "streaming" || joined.startsWith("streaming/")) {
    if (joined.includes("/webcam")) {
      return {
        categories: ["STREAMING"],
        subcategories: ["WEBCAM"],
      };
    }

    if (joined.includes("/microfono")) {
      return {
        categories: ["STREAMING"],
        subcategories: ["MICROPHONE"],
      };
    }

    if (joined.includes("/iluminacion")) {
      return {
        categories: ["STREAMING", "ACCESSORY"],
        subcategories: ["LIGHTING"],
      };
    }

    if (joined.includes("/accesorios")) {
      return {
        categories: ["STREAMING", "ACCESSORY"],
        subcategories: ["ACCESSORY", "STREAMING_ACCESSORY"],
      };
    }

    return {
      categories: ["STREAMING"],
      subcategories: [],
    };
  }

  if (joined === "consolas/acc" || joined.startsWith("consolas/")) {
    return {
      categories: ["ACCESSORY", "OTHER"],
      subcategories: ["CONSOLE", "CONTROLLER", "CONSOLE_ACCESSORY"],
    };
  }

  if (joined === "monitores" || joined.startsWith("monitores")) {
    return {
      categories: ["MONITOR"],
      subcategories: [],
    };
  }

  return {
    categories: ["PERIPHERAL", "STREAMING", "MONITOR", "ACCESSORY"],
    subcategories: [],
  };
}

async function getGamingStreamingProducts(slug: string[]) {
  const filter = resolveGamingStreamingFilter(slug);

  return prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      category: {
        in: filter.categories as any,
      },
      ...(filter.subcategories.length > 0
        ? {
            subcategory: {
              in: filter.subcategories,
            },
          }
        : {}),
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
}

export default async function GamingStreamingCatchAllPage({
  params,
}: PageProps) {
  const { slug } = params;
  const info = prettyFromSlug(slug);
  const products = await getGamingStreamingProducts(slug);

  return (
    <main className="rb-container mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <div className="mb-4 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-200">
          Home
        </Link>{" "}
        <span className="mx-1">/</span>
        <Link href="/gaming-streaming" className="hover:text-neutral-200">
          Gaming y Streaming
        </Link>{" "}
        <span className="mx-1">/</span>
        <span className="text-neutral-300">{info.breadcrumb}</span>
      </div>

      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
        {info.title}
      </h1>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
          <p className="text-xs font-extrabold tracking-wide text-neutral-400">
            GAMING Y STREAMING
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">
            {info.title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
            Aún no hay stock publicado en esta categoría. Estamos preparando el
            catálogo y pronto iremos agregando productos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/gaming-streaming"
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
            Cuando activemos stock, acá va listado + filtros + orden.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-lime-400"
            >
              <img
                src={p.imageUrl || "/placeholder.jpg"}
                alt={p.name}
                className="mb-3 h-40 w-full rounded-md object-cover"
              />

              {p.brand ? (
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                  {p.brand}
                </p>
              ) : null}

              <h2 className="font-bold text-white">{p.name}</h2>

              {p.shortDescription ? (
                <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
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
                  <span className="text-xs font-bold text-red-400">
                    Sin stock
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
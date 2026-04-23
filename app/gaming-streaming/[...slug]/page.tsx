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

function getGamingStreamingSeoContent(slug: string[]) {
  const path = slug.map((s) => decodeURIComponent(s).toLowerCase());
  const joined = path.join("/");

  if (joined === "perifericos") {
    return {
      banner: "/banners/perifericos.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:"aaaa",
    };
  }

  if (joined === "perifericos/audifonos") {
    return {
      banner: "/banners/audifonos.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Explora audífonos gamer con sonido envolvente, micrófono integrado y diseño cómodo para sesiones prolongadas. Son una excelente opción para juegos competitivos, comunicación en equipo, streaming y uso diario, priorizando calidad de audio, comodidad y presencia visual en tu setup.",
    };
  }

  if (joined === "perifericos/mouse") {
    return {
      banner: "/banners/mouse.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Descubre mouse gamer orientados a precisión, velocidad y comodidad. Aquí encontrarás opciones con sensores confiables, DPI ajustable y diseño ergonómico, ideales para shooters, MOBAs, trabajo diario o setups que buscan mejorar control, fluidez y estética.",
    };
  }

  if (joined === "perifericos/mousepad") {
    return {
      banner: "/banners/mousepad.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Los mousepads gamer ayudan a mejorar el deslizamiento, control y consistencia del sensor, además de aportar estética al escritorio. Son un complemento simple pero importante para setups competitivos, creativos y de uso diario, especialmente cuando buscas una experiencia más estable y cómoda.",
    };
  }

  if (joined === "perifericos/teclado") {
    return {
      banner: "/banners/teclados.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Encuentra teclados gamer y mecánicos con mejor respuesta, iluminación RGB y formatos pensados para distintos estilos de uso. Ya sea para gaming competitivo, productividad o estética de escritorio, esta categoría reúne opciones que buscan equilibrio entre sensación de escritura, diseño y funcionalidad.",
    };
  }

  if (joined === "streaming") {
    return {
      banner: "/banners/streaming.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "La categoría de streaming reúne productos orientados a mejorar audio, video, iluminación y presencia en cámara. Aquí podrás encontrar accesorios pensados para creadores, streamers y usuarios que buscan una configuración más profesional para transmitir, grabar o comunicarse con mejor calidad.",
    };
  }

  if (joined === "streaming/webcam") {
    return {
      banner: "/banners/webcam.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Las webcams son una excelente solución para videollamadas, reuniones, clases online y streaming. Esta categoría está pensada para quienes buscan mejorar su imagen en cámara con opciones prácticas, fáciles de integrar y útiles tanto en contextos profesionales como de creación de contenido.",
    };
  }

  if (joined === "streaming/microfono") {
    return {
      banner: "/banners/microfono.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Los micrófonos de streaming ayudan a mejorar claridad, presencia y calidad de voz en transmisiones, grabaciones, reuniones o partidas online. Aquí encontrarás opciones pensadas para usuarios que buscan un salto real en audio, tanto para entretenimiento como para trabajo o creación de contenido.",
    };
  }

  if (joined === "monitores") {
    return {
      banner: "/banners/monitores.jpg",
      overlayTitle: "",
      overlayText:
        "",
      description:
        "Explora monitores pensados para gaming, trabajo y entretenimiento. Esta categoría reúne opciones que priorizan calidad de imagen, fluidez, tamaño útil y comodidad visual, buscando adaptarse a distintos tipos de setup, desde escritorios compactos hasta estaciones más exigentes.",
    };
  }

  return null;
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
  const seoContent = getGamingStreamingSeoContent(slug);
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

      {seoContent ? (
        <div className="mb-8 space-y-6">
<div className="relative overflow-hidden rounded-2xl border border-neutral-800">
  <div className="relative w-full aspect-[1730/909] md:aspect-[1730/700]">
    <img
      src={seoContent.banner}
      alt={info.title}
      className="absolute inset-0 w-full h-full object-cover object-right opacity-90"
    />

    {/* overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
      {seoContent.overlayTitle && (
        <h2 className="text-xl font-extrabold text-white md:text-2xl">
          {seoContent.overlayTitle}
        </h2>
      )}

      {seoContent.overlayText && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-300">
          {seoContent.overlayText}
        </p>
      )}
    </div>
  </div>
</div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
            <p className="text-sm leading-relaxed text-neutral-300 md:text-base">
              {seoContent.description}
            </p>
          </div>
        </div>
      ) : null}

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
// app/gaming-streaming/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const GAMING_CATEGORIES = ["PERIPHERAL", "STREAMING", "ACCESSORY"] as const;
const GAMING_SUBCATEGORIES = [
  "MOUSE",
  "KEYBOARD",
  "MOUSEPAD",
  "HEADSET",
  "SPEAKER",
  "SPEAKERS",
  "WEBCAM",
  "MICROPHONE",
] as const;

async function getGamingStreamingProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      OR: [
        {
          category: {
            in: [...GAMING_CATEGORIES],
          },
        },
        {
          subcategory: {
            in: [...GAMING_SUBCATEGORIES],
          },
        },
      ],
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

export default async function GamingStreamingHomePage() {
  const products = await getGamingStreamingProducts();

  const lamzuProducts = products
    .filter((p) => `${p.brand ?? ""} ${p.name}`.toLowerCase().includes("lamzu"))
    .slice(0, 4);

  const attackSharkProducts = products
    .filter((p) => `${p.brand ?? ""} ${p.name}`.toLowerCase().includes("attack shark"))
    .slice(0, 4);

  const mouseProducts = products
    .filter((p) => {
      const txt = `${p.name} ${p.shortDescription ?? ""} ${p.brand ?? ""}`.toLowerCase();
      return txt.includes("mouse") || txt.includes("ultralig") || txt.includes("lamzu");
    })
    .slice(0, 4);

  const keyboardProducts = products
    .filter((p) => {
      const txt = `${p.name} ${p.shortDescription ?? ""} ${p.brand ?? ""}`.toLowerCase();
      return (
        txt.includes("teclado") ||
        txt.includes("keyboard") ||
        txt.includes("hall effect") ||
        txt.includes("rapid trigger")
      );
    })
    .slice(0, 4);

  return (
    <main className="rb-container mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <h1 className="mb-5 text-2xl font-extrabold md:text-3xl">Gaming y Streaming</h1>

      <section className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4 md:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime-300">
          Hub esports
        </p>
        <h2 className="mt-1.5 text-lg font-extrabold text-white md:text-xl">
          Periféricos premium para gaming competitivo en Chile
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
          Mouse gamer ultraligero, teclados magnéticos con Hall Effect y Rapid Trigger,
          audio gamer y accesorios de streaming para setups de alto rendimiento.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <Link
            href="/componentes"
            className="rounded-full border border-neutral-700 bg-black/25 px-2.5 py-1 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200"
          >
            Ver componentes
          </Link>
          <Link
            href="/setup-gamer"
            className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-1 font-bold text-lime-200 hover:bg-lime-400/15"
          >
            Armar setup gamer
          </Link>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
          <p className="text-xs font-extrabold tracking-wide text-neutral-400">CATEGORÍA</p>

          <h1 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">
            Gaming y Streaming
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
            Aún no hay stock publicado en esta sección.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-5 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-neutral-800 bg-neutral-950/45 p-3.5">
              <h2 className="text-sm font-extrabold text-white md:text-base">Lamzu en Chile</h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                Mouse orientados a precisión, control y ligereza para competitivo.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                {lamzuProducts.map((p) => (
                  <Link
                    key={`lamzu-${p.id}`}
                    href={`/producto/${p.slug}`}
                    className="rounded-full border border-neutral-700 bg-black/25 px-2.5 py-1 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-950/45 p-3.5">
              <h2 className="text-sm font-extrabold text-white md:text-base">Attack Shark en Chile</h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                Teclados y periféricos con enfoque en velocidad y experiencia premium.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                {attackSharkProducts.map((p) => (
                  <Link
                    key={`attack-${p.id}`}
                    href={`/producto/${p.slug}`}
                    className="rounded-full border border-neutral-700 bg-black/25 px-2.5 py-1 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-950/45 p-3.5">
              <h2 className="text-sm font-extrabold text-white md:text-base">Mouse gamer para FPS y setups competitivos</h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                Selección de mouse para tracking rápido, control y rendimiento en FPS.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                {mouseProducts.map((p) => (
                  <Link
                    key={`mouse-${p.id}`}
                    href={`/producto/${p.slug}`}
                    className="rounded-full border border-neutral-700 bg-black/25 px-2.5 py-1 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-950/45 p-3.5">
              <h2 className="text-sm font-extrabold text-white md:text-base">Teclados gamer, magnéticos y Hall Effect</h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                Opciones con Rapid Trigger y respuesta precisa para competitivo.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                {keyboardProducts.map((p) => (
                  <Link
                    key={`keyboard-${p.id}`}
                    href={`/producto/${p.slug}`}
                    className="rounded-full border border-neutral-700 bg-black/25 px-2.5 py-1 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </article>
          </section>

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
                    <span className="text-xs font-bold text-lime-300">Stock: {p.stock}</span>
                  ) : (
                    <span className="text-xs font-bold text-red-400">Sin stock</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
// app/gaming-streaming/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getGamingStreamingProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      category: {
        in: ["PERIPHERAL", "STREAMING", "MONITOR", "ACCESSORY"],
      },
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

  return (
    <main className="rb-container mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
        Gaming y Streaming
      </h1>

      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5 md:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
          Hub esports
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-white md:text-2xl">
          Periféricos premium para gaming competitivo en Chile
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
          Esta categoría reúne periféricos para mejorar precisión, tiempos de respuesta y confort:
          mouse ultraligero, teclados magnéticos con Hall Effect y Rapid Trigger, audio gamer y
          equipamiento para streaming en setups de alto rendimiento.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link href="/componentes" className="rounded-full border border-neutral-700 bg-black/25 px-3 py-1.5 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200">
            Ver componentes
          </Link>
          <Link href="/setup-gamer" className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 font-bold text-lime-200 hover:bg-lime-400/15">
            Armar setup gamer
          </Link>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
          <p className="text-xs font-extrabold tracking-wide text-neutral-400">
            CATEGORÍA
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">
            Gaming y Streaming
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
            Aún no hay stock publicado en esta sección.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/45 p-5">
            <h2 className="text-lg font-extrabold text-white">Marca: Lamzu en Chile</h2>
            <p className="mt-2 text-sm text-neutral-300">
              Descubre modelos Lamzu orientados a control, ligereza y tracking preciso para FPS y
              juego competitivo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {lamzuProducts.map((p) => (
                <Link key={`lamzu-${p.id}`} href={`/producto/${p.slug}`} className="rounded-full border border-neutral-700 bg-black/25 px-3 py-1.5 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200">
                  {p.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/45 p-5">
            <h2 className="text-lg font-extrabold text-white">Marca: Attack Shark en Chile</h2>
            <p className="mt-2 text-sm text-neutral-300">
              Teclados y periféricos Attack Shark con enfoque en velocidad, Rapid Trigger y experiencia
              premium para esports.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {attackSharkProducts.map((p) => (
                <Link key={`attack-${p.id}`} href={`/producto/${p.slug}`} className="rounded-full border border-neutral-700 bg-black/25 px-3 py-1.5 font-bold text-neutral-300 hover:border-lime-400/30 hover:text-lime-200">
                  {p.name}
                </Link>
              ))}
            </div>
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
        </>
      )}
    </main>
  );
}
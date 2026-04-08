// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";

export const dynamic = "force-dynamic";

function clp(value: number | null | undefined) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default async function Home() {
  const slides = [
    {
      src: "/banners/banner-1.jpg",
      alt: "RekaByte - Componentes y PCs armados",
      href: "/componentes",
    },
  ];

  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      featured: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      slug: true,
      name: true,
      kind: true,
      brand: true,
      shortDescription: true,
      imageUrl: true,
      stock: true,
      price: true,
      priceTransfer: true,
      priceCard: true,
      badge: true,
    },
  });

  const featuredBuilds = featuredProducts.filter((p) => p.kind === "PREBUILT_PC");
  const featuredComponents = featuredProducts.filter((p) => p.kind === "UNIT_PRODUCT");

  return (
    <main className="pb-14">
      {/* HERO CLÁSICO */}
      <section className="rb-container pt-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-5 text-center text-3xl font-black tracking-tight text-white md:text-4xl">
            Rendimiento y estética en perfecto equilibrio
          </h1>

          <HeroSlider slides={slides} intervalMs={5000} className="mb-10" />
        </div>
      </section>

      {/* BLOQUE DE LANZAMIENTO */}
      <section className="rb-container">
        <div className="mx-auto max-w-7xl rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-lime-300">
                Lanzamiento oficial RekaByte
              </div>

              <h2 className="mt-4 text-2xl font-black text-white md:text-3xl">
                Comenzamos con stock limitado, productos seleccionados y builds en evolución.
              </h2>

              <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-300 md:text-base">
              RekaByte nace para ofrecer componentes seleccionados, equipos bien ensamblados y un equilibrio ideal entre estética y rendimiento,
              junto con una experiencia de compra clara. En esta etapa, publicamos solo lo que podemos respaldar y entregar con calidad, 
              priorizando soporte y confianza por sobre la cantidad.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/modelos"
                  className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-lime-300"
                >
                  Ver computadores armados
                </Link>

                <Link
                  href="/componentes"
                  className="rounded-xl border border-neutral-700 bg-black/20 px-5 py-3 text-sm font-extrabold text-neutral-100 transition hover:bg-black/30"
                >
                  Ver componentes disponibles
                </Link>

                <Link
                  href="/contacto"
                  className="rounded-xl border border-lime-400/25 bg-lime-400/10 px-5 py-3 text-sm font-extrabold text-lime-300 transition hover:bg-lime-400/15"
                >
                  Cotizar mi PC
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">Armado profesional</div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Ensamble, orden interno y validación antes de entrega.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">Stock real</div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Lo publicado está disponible y listo para despacho o retiro.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">Envíos a todo Chile</div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Retiro previa coordinación a pasos de metro Lo Vial, San miguel y despachos nacionales.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">Soporte cercano</div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Atención directa para compra, seguimiento y postventa.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODELOS DESTACADOS */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Computadores armados
              </p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Modelos destacados para comenzar
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
                Equipos orientados a trabajo, estudio, gaming y crecimiento futuro,
                seleccionados para ofrecer una base sólida desde el primer día.
              </p>
            </div>

            <Link
              href="/modelos"
              className="text-sm font-extrabold text-lime-300 hover:text-lime-200"
            >
              Ver todos los modelos
            </Link>
          </div>

          {featuredBuilds.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredBuilds.map((product) => {
                const transferPrice =
                  product.priceTransfer && product.priceTransfer > 0
                    ? product.priceTransfer
                    : product.price;

                const hasStock = (product.stock ?? 0) > 0;

                return (
                  <Link
                    key={product.id}
                    href={`/modelos/${product.slug}`}
                    className="group overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 transition hover:border-lime-400/30 hover:bg-neutral-950"
                  >
                    <div className="relative aspect-[16/10] bg-black/30">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                          Sin imagen
                        </div>
                      )}

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {product.badge ? (
                          <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold text-black">
                            {product.badge}
                          </span>
                        ) : null}

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-extrabold",
                            hasStock
                              ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
                              : "border-red-500/20 bg-red-500/10 text-red-300",
                          ].join(" ")}
                        >
                          {hasStock ? "Disponible" : "Agotado"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-400">
                        {product.brand || "RekaByte"}
                      </p>

                      <h3 className="mt-2 text-xl font-black text-white">
                        {product.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-300">
                        {product.shortDescription ||
                          "Modelo preparado para ofrecer una experiencia sólida desde el primer día."}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-xs text-neutral-400">Desde</div>
                          <div className="text-2xl font-black text-lime-400">
                            {clp(transferPrice)}
                          </div>
                          <div className="mt-1 text-xs text-neutral-500">
                            Otros medios: {clp(product.priceCard || product.price)}
                          </div>
                        </div>

                        <span className="rounded-xl border border-neutral-700 px-3 py-2 text-xs font-extrabold text-neutral-200 transition group-hover:border-lime-400/30 group-hover:text-white">
                          Ver modelo
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/55 p-6 text-neutral-300">
              Aún no hay modelos destacados publicados.
            </div>
          )}
        </div>
      </section>

      {/* COMPONENTES DESTACADOS */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Componentes disponibles
              </p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Recién agregados 
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
                Componentes disponibles para despacho o retiro, enfocándonos en disponibilidad real y presentación clara.
              </p>
            </div>

            <Link
              href="/componentes"
              className="text-sm font-extrabold text-lime-300 hover:text-lime-200"
            >
              Ver todos los componentes
            </Link>
          </div>

          {featuredComponents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredComponents.map((product) => {
                const transferPrice =
                  product.priceTransfer && product.priceTransfer > 0
                    ? product.priceTransfer
                    : product.price;

                const hasStock = (product.stock ?? 0) > 0;

                return (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    className="group overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 transition hover:border-lime-400/30 hover:bg-neutral-950"
                  >
                    <div className="relative aspect-[4/3] bg-black/30">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                          Sin imagen
                        </div>
                      )}

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {product.badge ? (
                          <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold text-black">
                            {product.badge}
                          </span>
                        ) : null}

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-extrabold",
                            hasStock
                              ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
                              : "border-red-500/20 bg-red-500/10 text-red-300",
                          ].join(" ")}
                        >
                          {hasStock ? `Stock: ${product.stock ?? 0}` : "Agotado"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-400">
                        {product.brand || "Componente"}
                      </p>

                      <h3 className="mt-2 text-lg font-black text-white">
                        {product.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-300">
                        {product.shortDescription ||
                          "Producto seleccionado para builds equilibradas y upgrades futuros."}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-xs text-neutral-400">Transferencia</div>
                          <div className="text-2xl font-black text-lime-400">
                            {clp(transferPrice)}
                          </div>
                          <div className="mt-1 text-xs text-neutral-500">
                            Otros medios: {clp(product.priceCard || product.price)}
                          </div>
                        </div>

                        <span className="rounded-xl border border-neutral-700 px-3 py-2 text-xs font-extrabold text-neutral-200 transition group-hover:border-lime-400/30 group-hover:text-white">
                          Ver producto
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/55 p-6 text-neutral-300">
              Aún no hay componentes destacados publicados.
            </div>
          )}
        </div>
      </section>

      {/* POR QUÉ COMPRAR EN REKABYTE */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
              ¿Por qué comprar en RekaByte?
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Partimos pequeños, pero con estándar alto
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">Selección inicial</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Publicamos lo que realmente podemos respaldar y entregar bien.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">Atención directa</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Comunicación cercana para resolver dudas, cotizar y acompañar la compra.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">Builds con criterio</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                No armamos por llenar ficha técnica: buscamos equilibrio y confiabilidad.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">Base para crecer</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Este lanzamiento es el comienzo de un catálogo cada vez más sólido y completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl rounded-3xl border border-lime-400/20 bg-gradient-to-br from-lime-400/10 via-neutral-950 to-neutral-950 p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
                ¿No ves exactamente lo que buscas?
              </p>

              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Te ayudamos a cotizar un equipo o elegir el componente correcto.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
                Si quieres armar un PC desde cero, elegir un gabinete, definir una build
                para gaming o trabajo, o simplemente validar compatibilidades, te orientamos
                directamente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-extrabold text-black hover:bg-lime-300"
              >
                Solicitar cotización
              </Link>

              <Link
                href="/componentes"
                className="rounded-xl border border-neutral-700 bg-black/20 px-5 py-3 text-sm font-extrabold text-neutral-100 hover:bg-black/30"
              >
                Ver stock disponible
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
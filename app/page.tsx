import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import PremiumHorizontalCarousel from "@/components/PremiumHorizontalCarousel";

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
    take: 12,
    select: {
      id: true,
      slug: true,
      name: true,
      kind: true,
      category: true,
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

  const featuredBuilds = featuredProducts.filter(
    (p) => p.kind === "PREBUILT_PC"
  );

  const featuredPeripherals = featuredProducts.filter(
    (p) => p.kind === "UNIT_PRODUCT" && p.category === "PERIPHERAL"
  );

  const featuredComponents = featuredProducts.filter(
    (p) =>
      p.kind === "UNIT_PRODUCT" &&
      [
        "CPU",
        "MOTHERBOARD",
        "GPU",
        "RAM",
        "STORAGE",
        "CASE",
        "PSU",
        "CPU_COOLER",
        "CASE_FAN",
        "THERMAL_PASTE",
        "CABLE",
      ].includes(p.category)
  );

  const pillButtonClass =
    "group inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-5 py-2.5 text-sm font-extrabold text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.05),0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur transition-all duration-300 hover:-translate-y-[1px] hover:border-lime-300/45 hover:bg-lime-400/15 hover:text-lime-200 hover:shadow-[0_0_0_1px_rgba(163,230,53,0.10),0_12px_30px_rgba(163,230,53,0.10)]";

  return (
    <main className="pb-14">
      {/* HERO CLÁSICO */}
      <section className="rb-container pt-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-5 text-center text-3xl font-black tracking-tight text-white md:text-4xl">
            {/* aqui pongo el titulo arriba del banner */}
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
                Comenzamos con stock limitado, periféricos seleccionados y
                productos en constante evolución.
              </h2>

              <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-300 md:text-base">
                En RekaByte priorizamos una selección cuidada de teclados gamer,
                periféricos y productos para setup, buscando siempre un equilibrio
                entre estética, calidad y experiencia de uso. En esta etapa,
                publicamos solo lo que realmente podemos respaldar, priorizando
                confianza, atención cercana y una experiencia de compra clara.
                Además, también iremos incorporando equipos armados y productos
                seleccionados para quienes buscan una solución más completa.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/gaming-streaming/perifericos"
                  className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-lime-300"
                >
                  Ver teclados y periféricos
                </Link>

                <Link
                  href="/modelos"
                  className="rounded-xl border border-neutral-700 bg-black/20 px-5 py-3 text-sm font-extrabold text-neutral-100 transition hover:bg-black/30"
                >
                  Ver computadores armados
                </Link>

                <Link
                  href="/contacto"
                  className="rounded-xl border border-lime-400/25 bg-lime-400/10 px-5 py-3 text-sm font-extrabold text-lime-300 transition hover:bg-lime-400/15"
                >
                  Cotizar mi setup
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">
                  Selección cuidada
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Productos elegidos por calidad, estética y buena experiencia
                  de uso.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">Stock real</div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Lo publicado está disponible y listo para despacho o retiro.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">
                  Envíos a todo Chile
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Retiro previa coordinación a pasos de Metro Lo Vial, San Miguel,
                  y despachos nacionales.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">
                  Lanzamiento en etapa inicial
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Si detectas algún detalle o inconveniente, agradeceremos tu
                  aviso para mejorarlo lo antes posible.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <div className="text-sm font-black text-white">
                  Soporte cercano
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-400">
                  Atención directa para compra, seguimiento y postventa.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERIFÉRICOS DESTACADOS */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Periféricos disponibles
              </p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Periféricos para completar tu setup 🎮
              </h2>
              <p className="mt-2 text-sm leading-7 text-neutral-300 md:text-base">
                Periféricos seleccionados para mejorar tu experiencia desde el
                primer uso. Stock disponible para entrega o despacho.
              </p>
            </div>

            <div className="shrink-0 self-start md:self-end">
              <Link href="/gaming-streaming/perifericos" className={pillButtonClass}>
                <span>Ver todos los periféricos</span>
                <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>

          <PremiumHorizontalCarousel
            items={featuredPeripherals}
            fallbackBrand="Periférico"
            fallbackDescription="Periférico seleccionado para mejorar tu experiencia de juego, trabajo o streaming."
            emptyText="Aún no hay periféricos destacados publicados."
          />
        </div>
      </section>

      {/* COMPONENTES DESTACADOS */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Componentes disponibles
              </p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Arma o mejora tu PC
              </h2>
              <p className="mt-2 text-sm leading-7 text-neutral-300 md:text-base">
                Potencia tu PC con componentes seleccionados para rendimiento y
                estabilidad. Listos para despacho o retiro.
              </p>
            </div>

            <div className="shrink-0 self-start md:self-end">
              <Link href="/componentes" className={pillButtonClass}>
                <span>Ver todos los componentes</span>
                <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>

          <PremiumHorizontalCarousel
            items={featuredComponents}
            fallbackBrand="Componente"
            fallbackDescription="Producto seleccionado para builds equilibradas y upgrades futuros."
            emptyText="Aún no hay componentes destacados publicados."
          />
        </div>
      </section>

      {/* MODELOS DESTACADOS */}
      <section className="rb-container mt-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Computadores armados
              </p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Modelos destacados para comenzar
              </h2>
              <p className="mt-2 text-sm leading-7 text-neutral-300 md:text-base">
                Equipos orientados a trabajo, estudio, gaming y crecimiento
                futuro, seleccionados para ofrecer una base sólida desde el
                primer día.
              </p>
            </div>

            <div className="shrink-0 self-start md:self-end">
              <Link href="/modelos" className={pillButtonClass}>
                <span>Ver todos los modelos</span>
                <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
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
              <h3 className="text-base font-black text-white">
                Selección inicial
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Publicamos lo que realmente podemos respaldar y entregar bien.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">
                Atención directa
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Comunicación cercana para resolver dudas, cotizar y acompañar la
                compra.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">
                Builds con criterio
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                No armamos por llenar ficha técnica: buscamos equilibrio y
                confiabilidad.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
              <h3 className="text-base font-black text-white">
                Base para crecer
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Este lanzamiento es el comienzo de un catálogo cada vez más
                sólido y completo.
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
                Si quieres armar un PC desde cero, elegir un gabinete, definir
                una build para gaming o trabajo, o simplemente validar
                compatibilidades, te orientamos directamente.
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
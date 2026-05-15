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
      alt: "Periféricos gamer y setup RekaByte",
      href: "/gaming-streaming/perifericos",
    },
  ];

  const featuredPeripherals = await prisma.product.findMany({
    where: {
      isActive: true,
      featured: true,
      kind: "UNIT_PRODUCT",
      category: "PERIPHERAL",
      subcategory: {
        in: ["MOUSE", "KEYBOARD", "MOUSEPAD", "COMBO", "KEYBOARD_MOUSE_COMBO", "KIT"],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 18,
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

  const featuredStreaming = await prisma.product.findMany({
    where: {
      isActive: true,
      featured: true,
      kind: "UNIT_PRODUCT",
      category: "STREAMING",
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

  const featuredComponents = await prisma.product.findMany({
    where: {
      isActive: true,
      featured: true,
      kind: "UNIT_PRODUCT",
      category: { in: ["MOTHERBOARD", "CASE", "PSU", "CABLE"] },
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

  const featuredBuilds = await prisma.product.findMany({
    where: {
      isActive: true,
      featured: true,
      kind: "PREBUILT_PC",
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 6,
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

  const pillButtonClass =
    "group inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-5 py-2.5 text-sm font-extrabold text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.05),0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur transition-all duration-300 hover:-translate-y-[1px] hover:border-lime-300/45 hover:bg-lime-400/15 hover:text-lime-200";

  return (
    <main className="pb-16">
      <section className="rb-container pt-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">RekaByte Setup Store</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Periféricos gamer, setups y rendimiento real.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              Teclados, mouse, streaming y setups seleccionados para mejorar tu experiencia desde el primer uso.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/gaming-streaming/perifericos" className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-extrabold text-black hover:bg-lime-300">
                Ver periféricos
              </Link>
              <Link href="/setup-gamer" className="rounded-xl border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-extrabold text-lime-300 hover:bg-lime-400/20">
                Explorar Setup Gamer
              </Link>
            </div>
          </div>

          <HeroSlider slides={slides} intervalMs={5000} />
        </div>
      </section>

      <section className="rb-container mt-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">Encuentra tu setup</p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">El nuevo corazón de RekaByte</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                tier: "spawn",
                title: "Spawn",
                copy: "Tu primer setup gamer empieza aquí.",
                accent: "from-lime-500/25 via-emerald-400/10 to-neutral-950",
              },
              {
                tier: "loadout",
                title: "Loadout",
                copy: "Equilibrio entre rendimiento, comodidad y estética.",
                accent: "from-cyan-500/25 via-lime-500/10 to-neutral-950",
              },
              {
                tier: "clutch",
                title: "Clutch",
                copy: "Precisión, respuesta y control para jugar en serio.",
                accent: "from-fuchsia-500/25 via-lime-500/10 to-neutral-950",
              },
            ].map((card) => (
              <Link
                key={card.tier}
                href={`/setup-gamer?tier=${card.tier}`}
                className={`group rounded-2xl border border-neutral-800 bg-gradient-to-br ${card.accent} p-5 transition hover:-translate-y-0.5 hover:border-lime-400/60`}
              >
                <h3 className="text-xl font-black text-white">{card.title}</h3>
                <p className="mt-2 min-h-[48px] text-sm text-neutral-300">{card.copy}</p>
                <span className="mt-4 inline-flex items-center text-sm font-extrabold text-lime-300">Explorar →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rb-container mt-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">Periféricos destacados</p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Teclados, mouse, combos y mousepads</h2>
            </div>
            <Link href="/gaming-streaming/perifericos" className={pillButtonClass}>Ver periféricos →</Link>
          </div>
          <PremiumHorizontalCarousel
            items={featuredPeripherals}
            fallbackBrand="Periférico"
            fallbackDescription="Periférico seleccionado para setup gamer moderno."
            emptyText="Aún no hay periféricos destacados publicados."
          />
        </div>
      </section>

      <section className="rb-container mt-12">
        <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/55 p-5">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="text-xl font-black text-white">Streaming</h3>
              <Link href="/gaming-streaming/streaming" className={pillButtonClass}>Ver todo →</Link>
            </div>
            <PremiumHorizontalCarousel
              items={featuredStreaming}
              fallbackBrand="Streaming"
              fallbackDescription="Micrófonos y webcams para mejorar tu presencia."
              emptyText="Aún no hay productos de streaming destacados."
            />
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/55 p-5">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="text-xl font-black text-white">Últimos componentes disponibles</h3>
              <Link href="/componentes" className={pillButtonClass}>Ver componentes →</Link>
            </div>
            <PremiumHorizontalCarousel
              items={featuredComponents}
              fallbackBrand="Componente"
              fallbackDescription="Selección secundaria de componentes con stock real."
              emptyText="Aún no hay componentes destacados publicados."
            />
          </div>
        </div>
      </section>

      <section className="rb-container mt-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-neutral-800 bg-neutral-950/45 p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-500">PC Gamer</p>
              <h3 className="mt-1 text-xl font-black text-white">Disponible en sección secundaria</h3>
            </div>
            <Link href="/modelos" className={pillButtonClass}>Ver PC Gamer →</Link>
          </div>

          {featuredBuilds.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredBuilds.slice(0, 3).map((product) => (
                <Link key={product.id} href={`/modelos/${product.slug}`} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 hover:border-lime-400/50">
                  <h4 className="font-bold text-white">{product.name}</h4>
                  <p className="mt-1 text-sm text-neutral-400 line-clamp-2">{product.shortDescription || "PC gamer disponible en catálogo."}</p>
                  <p className="mt-3 font-extrabold text-lime-300">{clp(product.priceTransfer || product.price)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Aún no hay PCs armados destacados.</p>
          )}
        </div>
      </section>
    </main>
  );
}
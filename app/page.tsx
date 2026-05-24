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
      src: "/banners/bannerprincipal.jpg",
      alt: "Periféricos gamer, setups y rendimiento real",
      href: "/gaming-streaming/perifericos",
    },
    {
      src: "/banners/cyber2026.jpg",
      alt: "Tecnología que se siente en cada partida",
      href: "/cyber-2026",
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
      setupTier: true,
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
    "group inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-5 py-2.5 text-sm font-extrabold text-lime-300 transition-all duration-300 hover:-translate-y-[1px] hover:border-lime-300/50 hover:bg-lime-400/20 hover:text-lime-200";

  return (
    <main className="pb-14">
  <section className="pt-6">
    <div className="mx-auto max-w-[1800px] space-y-6 px-4 sm:px-6">
      

          <HeroSlider slides={slides} intervalMs={5000} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Teclados",
                href: "/gaming-streaming/perifericos/teclado",
                text: "Precisión táctil pro.",
                image: "/banners/Tecladohome.jpg",
                icon: "⌨",
              },
              {
                title: "Mouse",
                href: "/gaming-streaming/perifericos/mouse",
                text: "Control rápido y limpio.",
                image: "/banners/Mousehome.jpg",
                icon: "◉",
              },
              {
                title: "Combos",
                href: "/gaming-streaming/perifericos/kit-teclado-mouse",
                text: "Setup completo al instante.",
                image: "/banners/Combohome.jpg",
                icon: "▦",
              },
              {
                title: "Setup Gamer",
                href: "/setup-gamer",
                text: "Spawn, Loadout o Clutch.",
                image: "/banners/Setuphome.jpg",
                icon: "⬢",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative min-h-[240px] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition duration-300 hover:-translate-y-0.5 hover:border-lime-400/70"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90 transition duration-500 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
                <div className="relative z-10 flex h-full items-end p-5">
                  <div className="w-full">
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-lime-400/50 bg-black/55 text-sm font-extrabold text-lime-300">
                      {item.icon}
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-white">{item.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-neutral-200">{item.text}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-lime-400/60 bg-black/50 text-lime-300 transition group-hover:bg-lime-400/20">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

<section className="rb-container mt-11">
  <div className="mx-auto max-w-[1500px] rounded-3xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-7">
    <div className="grid gap-4 lg:grid-cols-[0.95fr_2.05fr] lg:items-stretch">
      <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">Encuentra tu setup</p>
        <h2 className="mt-2 text-3xl font-black text-white leading-tight">Desde Spawn hasta Clutch.</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-300">Elige según tu estilo, nivel y experiencia.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            tier: "spawn",
            title: "Spawn",
            copy: "Tu primer setup gamer empieza aquí.",
            accent: "from-lime-400/35 via-lime-300/10 to-black/70",
            glow: "shadow-[inset_0_0_0_1px_rgba(163,230,53,0.22),0_0_26px_rgba(163,230,53,0.14)]",
            textGlow: "drop-shadow-[0_0_10px_rgba(163,230,53,0.24)]",
            image: "/banners/spawn.jpg",
          },
          {
            tier: "loadout",
            title: "Loadout",
            copy: "Equilibrio entre rendimiento y comodidad.",
            accent: "from-cyan-400/32 via-lime-300/8 to-black/72",
            glow: "shadow-[inset_0_0_0_1px_rgba(34,211,238,0.24),0_0_26px_rgba(34,211,238,0.12)]",
            textGlow: "drop-shadow-[0_0_10px_rgba(34,211,238,0.24)]",
            image: "/banners/loadout.jpg",
          },
          {
            tier: "clutch",
            title: "Clutch",
            copy: "Precisión y respuesta para jugar en serio.",
            accent: "from-fuchsia-500/34 via-purple-500/14 to-black/70",
            glow: "shadow-[inset_0_0_0_1px_rgba(217,70,239,0.24),0_0_28px_rgba(217,70,239,0.14)]",
            textGlow: "drop-shadow-[0_0_10px_rgba(217,70,239,0.26)]",
            image: "/banners/clutch.jpg",
          },
        ].map((card) => (
          <Link
            key={card.tier}
            href={`/setup-gamer?tier=${card.tier}`}
            className={`group relative min-h-[220px] overflow-hidden rounded-2xl border border-neutral-800 md:min-h-[250px] lg:min-h-[280px] ${card.glow}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-95 transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${card.image})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${card.accent}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="relative z-10 flex h-full items-end p-4 md:p-5">
              <div>
                <h3 className={`text-[30px] font-black text-white leading-none md:text-[34px] ${card.textGlow}`}>{card.title}</h3>
                <p className="mt-2 max-w-[22ch] text-sm text-neutral-100">{card.copy}</p>
                <span className="mt-3 inline-flex items-center text-sm font-extrabold text-lime-300">Explorar →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
</section>

      <section className="rb-container mt-12">
        <div className="mx-auto max-w-[1500px] rounded-3xl border border-neutral-800 bg-neutral-950/55 p-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">Periféricos destacados</p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Lo más recomendado para tu setup</h2>
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

      <section className="rb-container mt-7">
        <div className="mx-auto max-w-[1500px] grid gap-2 md:grid-cols-5">
          {[
            { icon: "▣", label: "Stock real en Chile", sub: "Productos listos para despacho" },
            { icon: "◍", label: "Atención por WhatsApp", sub: "Respuesta rápida" },
            { icon: "◈", label: "Pago seguro", sub: "Transferencias y pasarelas" },
            { icon: "⬢", label: "Garantía de 6 meses", sub: "Respaldo en productos" },
            { icon: "⇢", label: "Despacho disponible", sub: "Cobertura nacional" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/45 px-3 py-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-lime-400/60 bg-black/40 text-lime-300 text-xs font-black">
                {item.icon}
              </span>
              <div>
                <p className="text-xs font-extrabold text-neutral-100">{item.label}</p>
                <p className="text-[11px] text-neutral-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rb-container mt-7">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">Aprende antes de elegir</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "¿Qué es un teclado magnético?", href: "/guias/que-es-un-teclado-magnetico", image: "/banners/magnetico.jpg" },
              { title: "¿Qué significa Rapid Trigger?", href: "/guias/que-significa-rapid-trigger", image: "/banners/rapid-trigger.jpg" },
              { title: "Mouse liviano vs mouse tradicional", href: "/guias/mouse-liviano-vs-tradicional", image: "/banners/mouse-liviano-vs-tradicional.jpg" },
              { title: "Cómo elegir tu primer setup", href: "/guias/como-elegir-tu-primer-setup", image: "/banners/comoelegir.jpg" },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative h-40 overflow-hidden rounded-2xl border border-neutral-800"
              >
                <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
                <div className="relative z-10 flex h-full flex-col justify-end p-4">
                  <h3 className="text-base font-black text-white leading-tight">{item.title}</h3>
                  <span className="mt-2 inline-flex text-sm font-extrabold text-lime-300">Leer guía →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rb-container mt-9">
        <div className="mx-auto max-w-[1500px] grid gap-5 lg:grid-cols-2">
          <Link
            href="/gaming-streaming/streaming"
            className="group block overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950"
          >
            <div className="relative min-h-[260px]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-500 group-hover:scale-[1.02]"
                style={{ backgroundImage: "url('/banners/streaminghome.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/58 to-black/20" />
              <div className="relative z-10 flex h-full items-end justify-between gap-4 p-6">
                <div className="max-w-md">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">Creator Setup</p>
                  <h3 className="mt-2 text-3xl font-black text-white">Streaming</h3>
                  <p className="mt-2 text-sm text-neutral-200">
                    Todo para crear, transmitir y elevar tu contenido al siguiente nivel.
                  </p>
                </div>
                <span className={pillButtonClass}>Ver todo →</span>
              </div>
            </div>
          </Link>

          <Link
            href="/componentes"
            className="group block overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950"
          >
            <div className="relative min-h-[260px]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-500 group-hover:scale-[1.02]"
                style={{ backgroundImage: "url('/banners/componentes.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/58 to-black/20" />
              <div className="relative z-10 flex h-full items-end justify-between gap-4 p-6">
                <div className="max-w-md">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">Setup Essentials</p>
                  <h3 className="mt-2 text-3xl font-black text-white">Componentes</h3>
                  <p className="mt-2 text-sm text-neutral-200">
                    Mejora tu rendimiento y construye un setup sólido con piezas clave.
                  </p>
                </div>
                <span className={pillButtonClass}>Ver componentes →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="rb-container mt-9">
        <div className="mx-auto max-w-[1500px] rounded-3xl border border-neutral-800 bg-neutral-950/45 p-4 md:p-5">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-500">PC Gamer</p>
          </div>

          {featuredBuilds.length > 0 ? (
            <Link
              href={`/modelos/${featuredBuilds[0].slug}`}
              className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/55 p-3 md:grid-cols-[1.2fr_1.8fr_0.9fr] md:items-center"
            >
              <div className="relative h-36 overflow-hidden rounded-xl border border-neutral-800">
                <img
                  src={featuredBuilds[0].imageUrl || "/banners/Setuphome.jpg"}
                  alt={featuredBuilds[0].name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white">{featuredBuilds[0].name}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
                  {featuredBuilds[0].shortDescription || "PC Gamer listo para jugar desde el primer día."}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-400">
                  <span>Rendimiento gaming</span>
                  <span>•</span>
                  <span>Stock real</span>
                  <span>•</span>
                  <span>Entrega inmediata</span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className="text-3xl font-black text-lime-300">{clp(featuredBuilds[0].priceTransfer || featuredBuilds[0].price)}</p>
                <span className="inline-flex items-center rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm font-extrabold text-lime-300">
                  Ver PC Gamer →
                </span>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-neutral-400">Aún no hay PCs armados destacados.</p>
          )}
        </div>
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
      </section>
    </main>
  );
}






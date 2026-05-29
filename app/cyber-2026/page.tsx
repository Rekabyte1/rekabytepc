import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPriceView } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Cyber 2026 en RekaByte | Ofertas Gamer, Periféricos y Setup",
  description:
    "Prepárate para el Cyber 2026 en RekaByte. Pronto cargaremos ofertas en periféricos gamer, teclados, mouse, audio, streaming y productos para setup gamer en Chile.",
};

const CYBER_BANNER = "/banners/cyber2026.jpg";
// Si tu banner está en otra ruta, cambia la constante CYBER_BANNER.

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "perifericos", label: "Periféricos" },
  { key: "teclados", label: "Teclados" },
  { key: "mouse", label: "Mouse" },
  { key: "audio", label: "Audio" },
  { key: "streaming", label: "Streaming" },
  { key: "setup-gamer", label: "Setup Gamer" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function normalizeText(v: unknown) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function clp(n: number) {
  return n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

function isCyberLabel(label: string | null | undefined) {
  const l = normalizeText(label);
  return l.includes("cyber2026") || l.includes("cyber");
}

function matchesFilter(
  filter: FilterKey,
  product: {
    category: string;
    subcategory: string | null;
    name: string;
    kind: string;
  }
) {
  if (filter === "todos") return true;

  const category = normalizeText(product.category);
  const sub = normalizeText(product.subcategory);
  const name = normalizeText(product.name);
  const kind = normalizeText(product.kind);

  if (filter === "setup-gamer") {
    return kind === "prebuilt_pc" || category === "prebuilt_pc";
  }

  if (filter === "streaming") {
    return category === "streaming" || sub.includes("stream") || name.includes("stream");
  }

  if (filter === "perifericos") {
    return category === "peripheral";
  }

  if (filter === "teclados") {
    return (
      category === "peripheral" &&
      (sub.includes("teclado") ||
        sub.includes("keyboard") ||
        name.includes("teclado") ||
        name.includes("keyboard"))
    );
  }

  if (filter === "mouse") {
    return (
      category === "peripheral" &&
      (sub.includes("mouse") || name.includes("mouse"))
    );
  }

  if (filter === "audio") {
    return (
      category === "peripheral" &&
      (sub.includes("audio") ||
        sub.includes("headset") ||
        sub.includes("audifono") ||
        sub.includes("microfono") ||
        name.includes("audio") ||
        name.includes("headset") ||
        name.includes("audifono") ||
        name.includes("microfono"))
    );
  }

  return true;
}

type CyberCardItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  brand: string | null;
  stock: number | null;
  saleLabel: string | null;
  salePercent: number | null;
  transferBase: number;
  transferFinal: number;
  cardBase: number;
  cardFinal: number;
};

function CyberProductCard({ p }: { p: CyberCardItem }) {
  const transferOnSale = p.transferBase > p.transferFinal;
  const cardOnSale = p.cardBase > p.cardFinal;
  const isOut = (p.stock ?? 0) <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 shadow-[0_10px_36px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5">
      <Link href={`/producto/${p.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-neutral-900">
          <Image
            src={p.image}
            alt={p.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized={/^https?:\/\//.test(p.image)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {isOut ? (
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] font-extrabold text-red-200">
                Agotado
              </span>
            ) : (
              <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-[11px] font-extrabold text-lime-300">
                Disponible
              </span>
            )}
          </div>

          {(transferOnSale || cardOnSale) && (
            <div className="absolute right-3 top-3 rounded-full bg-fuchsia-600 px-3 py-1 text-[11px] font-extrabold text-white">
              {p.saleLabel ?? "Cyber"} {p.salePercent ? `-${p.salePercent}%` : ""}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 md:p-5">
        {p.brand ? (
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-lime-300/90">
            {p.brand}
          </div>
        ) : null}

        <Link href={`/producto/${p.slug}`} className="block">
          <h3 className="line-clamp-2 text-base md:text-lg font-extrabold text-white hover:text-lime-300 transition-colors">
            {p.name}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-neutral-400">
          Stock:{" "}
          <span className={isOut ? "text-red-300" : "text-neutral-200"}>
            {isOut ? "Sin stock" : `${p.stock ?? 0} disponible(s)`}
          </span>
        </p>

        <div className="mt-4 rounded-xl border border-neutral-800 bg-black/25 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
            Transferencia
          </p>
          {transferOnSale ? (
            <>
              <p className="mt-1 text-xs text-neutral-500 line-through">
                {clp(p.transferBase)}
              </p>
              <p className="text-xl font-extrabold text-lime-400">
                {clp(p.transferFinal)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xl font-extrabold text-lime-400">
              {clp(p.transferFinal)}
            </p>
          )}

          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
            Otros medios
          </p>
          {cardOnSale ? (
            <>
              <p className="mt-1 text-xs text-neutral-500 line-through">
                {clp(p.cardBase)}
              </p>
              <p className="text-base font-bold text-white">{clp(p.cardFinal)}</p>
            </>
          ) : (
            <p className="mt-1 text-base font-bold text-white">{clp(p.cardFinal)}</p>
          )}
        </div>

        <Link
          href={`/producto/${p.slug}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-lime-400 px-4 py-3 text-sm font-extrabold text-black transition-colors hover:bg-lime-300"
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}

export default async function Cyber2026Page({
  searchParams,
}: {
  searchParams?: { filtro?: string };
}) {
  const filtroRaw = normalizeText(searchParams?.filtro);
  const currentFilter: FilterKey =
    FILTERS.find((f) => f.key === filtroRaw)?.key ?? "todos";

  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      saleEnabled: true,
    },
    orderBy: [{ salePriority: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      imageUrl: true,
      images: true,
      stock: true,
      price: true,
      priceTransfer: true,
      priceCard: true,
      saleEnabled: true,
      salePercent: true,
      saleStartsAt: true,
      saleEndsAt: true,
      saleLabel: true,
      kind: true,
      category: true,
      subcategory: true,
    },
  });

  const cyberActive = dbProducts
    .filter((p) => isCyberLabel(p.saleLabel))
    .map((p) => {
      const pricing = buildPriceView(p);
      return { ...p, pricing };
    })
    .filter((p) => p.pricing.sale.active);

  const filteredProducts = cyberActive.filter((p) =>
    matchesFilter(currentFilter, {
      category: p.category,
      subcategory: p.subcategory,
      name: p.name,
      kind: p.kind,
    })
  );

  const cardsData: CyberCardItem[] = filteredProducts.map((p) => {
    const firstImage =
      p.imageUrl || p.images.find((img) => Boolean(img)) || "/product-placeholder.png";

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: firstImage,
      brand: p.brand ?? null,
      stock: p.stock ?? 0,
      saleLabel: p.pricing.sale.label ?? p.saleLabel ?? null,
      salePercent: p.pricing.transfer.discountPercent ?? null,
      transferBase: p.pricing.transfer.base,
      transferFinal: p.pricing.transfer.final,
      cardBase: p.pricing.card.base,
      cardFinal: p.pricing.card.final,
    };
  });

  return (
    <main className="rb-container mx-auto max-w-7xl px-4 py-8 md:py-12 text-neutral-100">
      <nav className="mb-5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-300">
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-neutral-300">Cyber 2026</span>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 shadow-[0_12px_48px_rgba(0,0,0,0.45)]">
        <div className="relative">
          <div className="relative aspect-[21/9] w-full min-h-[180px] md:min-h-[300px] bg-neutral-900">
            <Image
              src={CYBER_BANNER}
              alt="Cyber 2026 en RekaByte"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 md:p-8">
            <span className="inline-flex rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-extrabold text-lime-300">
              CYBER 2026 CHILE
            </span>
            <h1 className="mt-3 text-2xl md:text-4xl font-black tracking-tight text-white">
              Cyber 2026 en RekaByte
            </h1>
            <p className="mt-2 max-w-3xl text-sm md:text-base text-neutral-200">
              Encuentra ofertas gamer en periféricos gamer, teclados mecánicos,
              mouse gamer, streaming y setup gamer en Chile.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5 md:p-7">
        <h2 className="text-xl md:text-2xl font-extrabold text-white">
          Cyber 2026 Chile en RekaByte
</h2> <p className="mt-3 text-sm md:text-base leading-relaxed text-neutral-300"> Descubre las mejores ofertas de <strong>Cyber 2026</strong> en{" "} 
<strong>RekaByte</strong>. Encuentra descuentos especiales en{" "}
 <strong>periféricos gamer</strong>, <strong>teclados mecánicos</strong>,{" "} <strong>mouse gamer</strong>, <strong>audio</strong>,{" "} <strong>streaming</strong> y accesorios para tu <strong>setup gamer</strong>. Las ofertas se actualizan automáticamente durante el evento y están sujetas a disponibilidad de stock. </p> </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg md:text-xl font-extrabold text-white">
            Explora por categoría
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.key === currentFilter;
            return (
              <Link
                key={f.key}
                href={f.key === "todos" ? "/cyber-2026" : `/cyber-2026?filtro=${f.key}`}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "border-lime-400/50 bg-lime-400/15 text-lime-300"
                    : "border-neutral-700 bg-neutral-900/70 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        {cardsData.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cardsData.map((product) => (
              <CyberProductCard key={product.id} p={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-lime-400/25 bg-lime-400/5 p-5 md:p-6">
            <h4 className="text-base md:text-lg font-extrabold text-lime-300">
              Las ofertas estarán disponibles pronto.
            </h4>
            <p className="mt-2 text-sm md:text-base text-neutral-200">
              Pronto estaremos cargando los productos en oferta.
            </p>
            <p className="mt-1 text-sm md:text-base text-neutral-300">
              Vuelve pronto para descubrir ofertas Cyber en periféricos gamer,
              streaming y setup.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
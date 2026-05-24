import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartButton from "@/components/AddToCartButton";
import SaleCountdown from "@/components/SaleCountdown";
import PremiumProductSections, {
  type PremiumSection,
} from "@/components/PremiumProductSections";
import { buildPriceView } from "@/lib/pricing";

type PageProps = {
  params: { slug: string };
};

type ProductSeoInput = {
  slug: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  specs?: unknown;
};

type BreadcrumbItem = { label: string; href: string };

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.rekabyte.cl";
}

function toAbsoluteUrl(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `${appUrl()}${trimmed}`;
  return `${appUrl()}/${trimmed}`;
}

function buildSemanticBreadcrumb(product: {
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  name: string;
}): BreadcrumbItem[] {
  const category = String(product.category ?? "").trim().toUpperCase();
  const subcategory = String(product.subcategory ?? "").trim().toUpperCase();
  const text = `${product.name} ${product.brand ?? ""} ${subcategory}`.toLowerCase();

  const componentMap: Record<string, string> = {
    CPU: "Procesadores",
    MOTHERBOARD: "Placas madre",
    GPU: "Tarjetas gráficas",
    RAM: "Memorias RAM",
    STORAGE: "Almacenamiento",
    CASE: "Gabinetes",
    PSU: "Fuentes de poder",
    CPU_COOLER: "Refrigeración CPU",
    CASE_FAN: "Ventiladores",
    THERMAL_PASTE: "Pasta térmica",
    CABLE: "Cables",
    MONITOR: "Monitores",
  };

  const peripheralSubMap: Record<string, string> = {
    MOUSE: "Mouse",
    KEYBOARD: "Teclados",
    MOUSEPAD: "Mousepads",
    HEADSET: "Audífonos",
    SPEAKER: "Parlantes",
    SPEAKERS: "Parlantes",
    WEBCAM: "Webcams",
    MICROPHONE: "Micrófonos",
  };

  const isPeripheralAccessory =
    category === "PERIPHERAL" ||
    category === "ACCESSORY" ||
    peripheralSubMap[subcategory] !== undefined ||
    text.includes("mouse") ||
    text.includes("teclado") ||
    text.includes("keyboard") ||
    text.includes("audif") ||
    text.includes("headset") ||
    text.includes("parlante") ||
    text.includes("speaker") ||
    text.includes("webcam") ||
    text.includes("microfono") ||
    text.includes("microphone");

  if (category === "STREAMING") {
    return [
      { label: "Gaming y Streaming", href: "/gaming-streaming" },
      { label: "Streaming", href: "/gaming-streaming" },
    ];
  }

  if (isPeripheralAccessory) {
    const subLabel = peripheralSubMap[subcategory];
    return [
      { label: "Gaming y Streaming", href: "/gaming-streaming" },
      { label: "Periféricos", href: "/gaming-streaming" },
      ...(subLabel ? [{ label: subLabel, href: "/gaming-streaming" }] : []),
    ];
  }

  if (componentMap[category]) {
    return [
      { label: "Componentes", href: "/componentes" },
      { label: componentMap[category], href: "/componentes" },
    ];
  }

  return [{ label: "Componentes", href: "/componentes" }];
}

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function normalizeSpecs(specs: unknown): Array<[string, string]> {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs as Record<string, unknown>)
    .filter(([rawKey, value]) => {
      const key = String(rawKey).trim().toLowerCase();
      if (key === "premiumsections") return false;
      if (value === null || value === undefined) return false;
      if (typeof value === "object") return false;
      return true;
    })
    .map(([key, value]) => [key, String(value)]);
}

function extractPremiumSections(specs: unknown): PremiumSection[] {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  const raw = (specs as Record<string, unknown>).premiumSections;
  if (!Array.isArray(raw)) return [];
  return raw as PremiumSection[];
}

function detectProductType(input: {
  name: string;
  category?: string | null;
  subcategory?: string | null;
  specs?: unknown;
}) {
  const haystack = `${input.name} ${input.category ?? ""} ${
    input.subcategory ?? ""
  } ${JSON.stringify(input.specs ?? {})}`.toLowerCase();

  const isMouse =
    /\bmouse\b|\brat[oó]n\b|\blamzu\b|\bpaw3950\b/.test(haystack);
  const isKeyboard =
    /\bteclado\b|\bkeyboard\b|\brapid trigger\b|\bhall effect\b|\bx68he\b/.test(
      haystack
    );

  if (isMouse) return "mouse";
  if (isKeyboard) return "keyboard";
  return "peripheral";
}

function buildSeoSubtitle(input: {
  shortDescription?: string | null;
  description?: string | null;
}) {
  const cleanText = (value: string) =>
    value
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim();

  const summarize = (value: string, maxLength = 180) => {
    const normalized = cleanText(value);
    if (!normalized) return "";
    if (normalized.length <= maxLength) return normalized;
    const cut = normalized.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    const base = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim();
    return `${base}…`;
  };

  const short = cleanText(input.shortDescription ?? "");
  if (short) return summarize(short, 180);

  const description = cleanText(input.description ?? "");
  if (description) return summarize(description, 180);

  return "Producto gamer seleccionado por RekaByte para rendimiento, calidad y experiencia premium.";
}

function scoreRelatedProduct(
  base: {
    brand?: string | null;
    category?: string | null;
    subcategory?: string | null;
    name: string;
  },
  candidate: {
    brand?: string | null;
    category?: string | null;
    subcategory?: string | null;
    name: string;
  }
) {
  let score = 0;
  const norm = (v: string | null | undefined) =>
    String(v ?? "").trim().toLowerCase();

  if (norm(base.brand) && norm(base.brand) === norm(candidate.brand)) score += 10;
  if (norm(base.subcategory) && norm(base.subcategory) === norm(candidate.subcategory))
    score += 8;
  if (norm(base.category) && norm(base.category) === norm(candidate.category)) score += 5;

  const baseName = norm(base.name);
  const candidateName = norm(candidate.name);
  if (baseName && candidateName) {
    const baseTokens = baseName.split(/[\s-]+/).filter((t) => t.length >= 3);
    const candidateTokens = new Set(
      candidateName.split(/[\s-]+/).filter((t) => t.length >= 3)
    );
    for (const token of baseTokens) {
      if (candidateTokens.has(token)) score += 2;
    }
  }

  return score;
}

function buildAutoSeoTitle(input: ProductSeoInput) {
  const type = detectProductType(input);
  const cleanName = input.name.trim();

  if (type === "mouse") {
    return `${cleanName} - Mouse Gamer Ultraligero 8K | RekaByte Chile`;
  }

  if (type === "keyboard") {
    return `${cleanName} - Teclado Magnético Rapid Trigger | RekaByte Chile`;
  }

  const brandChunk = input.brand ? `${input.brand} ` : "";
  return `${cleanName} - ${brandChunk}Periférico Gamer | RekaByte Chile`;
}

function pickSpecsSnippets(specs: unknown) {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  const entries = Object.entries(specs as Record<string, unknown>);
  const wanted = [
    "peso",
    "weight",
    "polling",
    "8k",
    "sensor",
    "paw",
    "hall",
    "rapid",
    "switch",
    "wireless",
    "inalambr",
  ];

  const snippets: string[] = [];
  for (const [k, v] of entries) {
    const key = String(k).toLowerCase();
    const value = String(v ?? "");
    if (!value) continue;
    if (wanted.some((w) => key.includes(w) || value.toLowerCase().includes(w))) {
      snippets.push(`${k}: ${value}`);
    }
    if (snippets.length >= 2) break;
  }

  return snippets;
}

function buildAutoSeoDescription(input: ProductSeoInput) {
  const type = detectProductType(input);
  const countryChunk = "en Chile";
  const brandChunk = input.brand ? `${input.brand} ` : "";
  const short = input.shortDescription?.trim() || input.description?.trim() || "";
  const specsBits = pickSpecsSnippets(input.specs);
  const specsText = specsBits.length ? ` ${specsBits.join(", ")}.` : "";

  if (type === "mouse") {
    return `Compra el ${input.name} ${countryChunk}. ${brandChunk}mouse gamer ultraligero orientado a FPS y esports competitivos.${specsText}${
      short ? ` ${short}` : ""
    }`.trim();
  }

  if (type === "keyboard") {
    return `Compra el ${input.name} ${countryChunk}. Teclado magnético gaming con Rapid Trigger, switches Hall Effect y enfoque competitivo.${specsText}${
      short ? ` ${short}` : ""
    }`.trim();
  }

  return `Compra ${input.name} ${countryChunk}. ${brandChunk}periférico gamer seleccionado para rendimiento, comodidad y experiencia premium.${specsText}${
    short ? ` ${short}` : ""
  }`.trim();
}

function resolveSeo(input: ProductSeoInput) {
  const title = input.seoTitle?.trim() || buildAutoSeoTitle(input);
  const description =
    input.seoDescription?.trim() || buildAutoSeoDescription(input);
  const canonical = `https://www.rekabyte.cl/producto/${input.slug}`;

  const ogImage =
    input.images && input.images.length > 0
      ? input.images[0]
      : input.imageUrl || undefined;

  return { title, description, canonical, ogImage };
}

export default async function ProductPage({ params }: PageProps) {
  const dbProduct = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!dbProduct || !dbProduct.isActive) {
    notFound();
  }

  const images =
    dbProduct.images && dbProduct.images.length > 0
      ? dbProduct.images
      : dbProduct.imageUrl
      ? [dbProduct.imageUrl]
      : [];

  const specs = normalizeSpecs(dbProduct.specs);
  const premiumSections = extractPremiumSections(dbProduct.specs);
  const inStock = (dbProduct.stock ?? 0) > 0;
  const pricing = buildPriceView(dbProduct);
  const canonicalUrl = `${appUrl()}/producto/${dbProduct.slug}`;
  const primaryImage = images[0] ?? null;
  const absolutePrimaryImage = toAbsoluteUrl(primaryImage);
  const absoluteImages = images
    .map((img) => toAbsoluteUrl(img))
    .filter(Boolean) as string[];

  const breadcrumbItems = buildSemanticBreadcrumb({
    category: dbProduct.category as string | null,
    subcategory: dbProduct.subcategory,
    brand: dbProduct.brand,
    name: dbProduct.name,
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appUrl(),
      },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `${appUrl()}${item.href}`,
      })),
      {
        "@type": "ListItem",
        position: breadcrumbItems.length + 2,
        name: dbProduct.name,
        item: canonicalUrl,
      },
    ],
  };

  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: dbProduct.name,
    description:
      dbProduct.shortDescription?.trim() ||
      dbProduct.description?.trim() ||
      "Producto disponible en RekaByte Chile.",
    url: canonicalUrl,
    image: absoluteImages.length
      ? absoluteImages
      : absolutePrimaryImage
      ? [absolutePrimaryImage]
      : [],
    category: dbProduct.category,
    offers: {
      "@type": "Offer",
      price: String(pricing.transfer.final ?? 0),
      priceCurrency: "CLP",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: canonicalUrl,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (dbProduct.brand?.trim()) {
    productSchema.brand = {
      "@type": "Brand",
      name: dbProduct.brand.trim(),
    };
  }

  if (dbProduct.sku?.trim()) {
    productSchema.sku = dbProduct.sku.trim();
  }

  const seoSubtitle = buildSeoSubtitle({
    shortDescription: dbProduct.shortDescription,
    description: dbProduct.description,
  });

  const relatedCandidates = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: dbProduct.id },
      OR: [
        { brand: dbProduct.brand ?? undefined },
        { subcategory: dbProduct.subcategory ?? undefined },
        { category: dbProduct.category },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      category: true,
      subcategory: true,
      shortDescription: true,
      imageUrl: true,
      images: true,
      stock: true,
      priceTransfer: true,
      priceCard: true,
      price: true,
    },
    take: 16,
  });

  const relatedProducts = relatedCandidates
    .map((p) => ({
      ...p,
      score: scoreRelatedProduct(
        {
          brand: dbProduct.brand,
          category: dbProduct.category as string | null,
          subcategory: dbProduct.subcategory,
          name: dbProduct.name,
        },
        {
          brand: p.brand,
          category: p.category as string | null,
          subcategory: p.subcategory,
          name: p.name,
        }
      ),
    }))
    .sort((a, b) => b.score - a.score || (b.stock ?? 0) - (a.stock ?? 0))
    .slice(0, 4);

  return (
    <main className="rb-container mx-auto max-w-7xl px-4 py-10 text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mb-4 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-200">
          Home
        </Link>{" "}
        <span className="mx-1">/</span>
        {breadcrumbItems.map((item) => (
          <span key={`${item.href}-${item.label}`}>
            <Link href={item.href} className="hover:text-neutral-200">
              {item.label}
            </Link>{" "}
            <span className="mx-1">/</span>
          </span>
        ))}
        <span className="text-neutral-300">{dbProduct.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4 md:p-5">
          <ProductImageGallery images={images} productName={dbProduct.name} />
        </section>

        <aside className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5 md:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {pricing.sale.active ? (
              <span className="rounded-full bg-fuchsia-600 px-3 py-1 text-xs font-extrabold text-white">
                {pricing.sale.label ?? "Oferta"} -{pricing.transfer.discountPercent}%
              </span>
            ) : null}
            {dbProduct.brand ? (
              <span className="rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-extrabold text-lime-300">
                {dbProduct.brand}
              </span>
            ) : null}
            {dbProduct.badge ? (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-extrabold text-white">
                {dbProduct.badge}
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl font-extrabold text-white md:text-4xl">
            {dbProduct.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300 md:text-[15px]">
            {seoSubtitle}
          </p>

          <div className="mt-4 space-y-2 text-sm text-neutral-400">
            {dbProduct.sku ? <p>Código: {dbProduct.sku}</p> : null}
            <p>
              Stock:{" "}
              <span className={inStock ? "text-lime-400" : "text-red-400"}>
                {inStock ? `${dbProduct.stock ?? 0} disponible(s)` : "Sin stock"}
              </span>
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/30 p-4">
            <p className="text-sm text-neutral-400">Pago con transferencia</p>
            {pricing.transfer.active ? (
              <>
                <p className="text-sm text-neutral-500 line-through">
                  {formatPrice(pricing.transfer.base)}
                </p>
                <p className="text-3xl font-extrabold text-lime-400">
                  {formatPrice(pricing.transfer.final)}
                </p>
              </>
            ) : (
              <p className="text-3xl font-extrabold text-lime-400">
                {formatPrice(pricing.transfer.final)}
              </p>
            )}

            <p className="mt-3 text-sm text-neutral-400">Otros medios de pago</p>
            {pricing.card.active ? (
              <>
                <p className="text-sm text-neutral-500 line-through">
                  {formatPrice(pricing.card.base)}
                </p>
                <p className="text-xl font-bold text-white">
                  {formatPrice(pricing.card.final)}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-white">
                {formatPrice(pricing.card.final)}
              </p>
            )}
            {pricing.sale.active ? <SaleCountdown endsAt={pricing.sale.endsAt} /> : null}
          </div>

          <div className="mt-6 grid gap-3">
            <AddToCartButton slug={dbProduct.slug} name={dbProduct.name} />

            {inStock ? (
              <AddToCartButton
                slug={dbProduct.slug}
                name={dbProduct.name}
                mode="buy_now"
                className="!bg-lime-400 !text-black hover:!bg-lime-300 disabled:!bg-neutral-700 disabled:!text-neutral-400"
              />
            ) : null}
          </div>

          {dbProduct.manufacturerPdfUrl ? (
            <a
              href={dbProduct.manufacturerPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex text-sm font-extrabold text-lime-300 hover:text-lime-200"
            >
              Ver ficha del fabricante
            </a>
          ) : null}
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6">
        <h2 className="text-xl font-extrabold text-white">Descripción</h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-300 md:text-base">
          {dbProduct.description || dbProduct.shortDescription || "Sin descripción."}
        </p>
      </section>

      {premiumSections.length > 0 ? (
        <PremiumProductSections sections={premiumSections} />
      ) : null}

      {relatedProducts.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 md:p-5">
          <h2 className="text-xl font-extrabold text-white">También te puede interesar</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Más periféricos premium para tu setup y productos relacionados por marca y
            categoría.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => {
              const pImages =
                p.images && p.images.length > 0
                  ? p.images
                  : p.imageUrl
                  ? [p.imageUrl]
                  : [];
              const pImage = pImages[0] ?? "/placeholder.jpg";
              const pPricing = buildPriceView({
                ...dbProduct,
                ...p,
              } as any);
              const pInStock = (p.stock ?? 0) > 0;

              return (
                <Link
                  key={p.id}
                  href={`/producto/${p.slug}`}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 transition hover:border-lime-400/60"
                >
                  <div className="relative mb-3 overflow-hidden rounded-lg border border-neutral-800 bg-black/30">
                    <img
                      src={pImage}
                      alt={p.name}
                      className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  {p.brand ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                      {p.brand}
                    </p>
                  ) : null}

                  <h3 className="mt-1 line-clamp-2 text-sm font-bold text-white">{p.name}</h3>

                  {p.shortDescription ? (
                    <p className="mt-2 line-clamp-2 text-xs text-neutral-400">
                      {p.shortDescription}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-lime-400">
                      {formatPrice(pPricing.transfer.final)}
                    </p>
                    <span
                      className={`text-[11px] font-bold ${
                        pInStock ? "text-lime-300" : "text-red-400"
                      }`}
                    >
                      {pInStock ? "Con stock" : "Sin stock"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {specs.length > 0 && (
        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 md:p-5">
          <details className="group rounded-xl border border-lime-500/20 bg-black/20 open:border-lime-400/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-white marker:content-none">
              <h2 className="text-sm font-bold tracking-wide text-neutral-200 md:text-base">
                Especificaciones técnicas
              </h2>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-lime-500/30 bg-lime-500/10 text-lime-300 transition-transform duration-300 group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>

            <div className="grid grid-rows-[0fr] transition-all duration-300 ease-out group-open:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <div className="mt-1 overflow-hidden rounded-b-xl border-t border-lime-500/10">
                  {specs.map(([label, value], idx) => (
                    <div
                      key={label}
                      className={`grid grid-cols-1 gap-2 border-b border-neutral-800/80 px-4 py-3 md:grid-cols-[220px_1fr] ${
                        idx === specs.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wide text-neutral-400 md:text-sm">
                        {label}
                      </div>
                      <div className="text-sm text-neutral-100">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </section>
      )}
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const dbProduct = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      name: true,
      brand: true,
      category: true,
      subcategory: true,
      description: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      imageUrl: true,
      images: true,
      specs: true,
      isActive: true,
    },
  });

  if (!dbProduct || !dbProduct.isActive) {
    return { title: "Producto no encontrado" };
  }

  const seo = resolveSeo({
    slug: dbProduct.slug,
    name: dbProduct.name,
    brand: dbProduct.brand,
    category: dbProduct.category as string | null,
    subcategory: dbProduct.subcategory as string | null,
    description: dbProduct.description,
    shortDescription: dbProduct.shortDescription,
    seoTitle: dbProduct.seoTitle,
    seoDescription: dbProduct.seoDescription,
    imageUrl: dbProduct.imageUrl,
    images: dbProduct.images as string[] | null,
    specs: dbProduct.specs,
  });

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      siteName: "RekaByte",
      locale: "es_CL",
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartButton from "@/components/AddToCartButton";
import SaleCountdown from "@/components/SaleCountdown";
import { buildPriceView } from "@/lib/pricing";

type PageProps = {
  params: { slug: string };
};

type BreadcrumbItem = {
  label: string;
  href?: string;
};

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function normalizeSpecs(specs: unknown): Array<[string, string]> {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs as Record<string, unknown>).map(([key, value]) => [
    key,
    String(value ?? ""),
  ]);
}

function categoryLabel(category?: string | null) {
  const map: Record<string, string> = {
    PSU: "Fuentes de poder",
    CASE: "Gabinetes",
    MOTHERBOARD: "Placas madre",
    GPU: "Tarjetas de video",
    CPU: "Procesadores",
    RAM: "Memorias RAM",
    STORAGE: "Almacenamiento",
    CPU_COOLER: "Coolers CPU",
    CASE_FAN: "Ventiladores",
    THERMAL_PASTE: "Pasta térmica",
    CABLE: "Cables",
  };
  return map[String(category ?? "")] ?? "Componentes";
}

function buildBreadcrumb(params: {
  kind?: string | null;
  category?: string | null;
  productName: string;
}): BreadcrumbItem[] {
  const { kind, category, productName } = params;
  const cat = String(category ?? "");
  const k = String(kind ?? "");

  const home: BreadcrumbItem = { label: "Home", href: "/" };

  if (cat === "PERIPHERAL") {
    return [
      home,
      { label: "Gaming y Streaming", href: "/gaming-streaming" },
      { label: "Periféricos", href: "/gaming-streaming/perifericos" },
      { label: productName },
    ];
  }

  if (cat === "STREAMING") {
    return [
      home,
      { label: "Gaming y Streaming", href: "/gaming-streaming" },
      { label: "Streaming", href: "/gaming-streaming/streaming" },
      { label: productName },
    ];
  }

  if (cat === "MONITOR") {
    return [
      home,
      { label: "Gaming y Streaming", href: "/gaming-streaming" },
      { label: "Monitores", href: "/gaming-streaming/monitores" },
      { label: productName },
    ];
  }

  const isComponent =
    cat === "PSU" ||
    cat === "CASE" ||
    cat === "MOTHERBOARD" ||
    cat === "GPU" ||
    cat === "CPU" ||
    cat === "RAM" ||
    cat === "STORAGE" ||
    cat === "CPU_COOLER" ||
    cat === "CASE_FAN" ||
    cat === "THERMAL_PASTE" ||
    cat === "CABLE";

  if (isComponent) {
    return [
      home,
      { label: "Componentes", href: "/componentes" },
      { label: categoryLabel(cat), href: "/componentes" },
      { label: productName },
    ];
  }

  if (k === "PREBUILT_PC" || cat === "PREBUILT_PC") {
    return [
      home,
      { label: "Setup Gamer", href: "/setup-gamer" },
      { label: productName },
    ];
  }

  return [
    home,
    { label: "Componentes", href: "/componentes" },
    { label: productName },
  ];
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
  const inStock = (dbProduct.stock ?? 0) > 0;
  const pricing = buildPriceView(dbProduct);

  const breadcrumb = buildBreadcrumb({
    kind: dbProduct.kind,
    category: dbProduct.category,
    productName: dbProduct.name,
  });

  return (
    <main className="rb-container mx-auto max-w-7xl px-4 py-10 text-neutral-100">
      <div className="mb-4 text-xs text-neutral-500">
        {breadcrumb.map((item, idx) => {
          const isLast = idx === breadcrumb.length - 1;
          return (
            <span key={`${item.label}-${idx}`}>
              {idx > 0 ? <span className="mx-1">/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-neutral-200">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-neutral-300" : "hover:text-neutral-200"}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
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

            <AddToCartButton
              slug={dbProduct.slug}
              name={dbProduct.name}
              mode="buy_now"
              className="!bg-lime-400 !text-black hover:!bg-lime-300 disabled:!bg-neutral-700 disabled:!text-neutral-400"
            />
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

      {specs.length > 0 && (
        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6">
          <h2 className="text-xl font-extrabold text-white">Especificaciones</h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-800">
            {specs.map(([label, value], idx) => (
              <div
                key={label}
                className={`grid grid-cols-1 gap-2 border-b border-neutral-800 px-4 py-3 md:grid-cols-[260px_1fr] ${
                  idx === specs.length - 1 ? "border-b-0" : ""
                }`}
              >
                <div className="text-sm font-bold text-neutral-300">{label}</div>
                <div className="text-sm text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const dbProduct = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      imageUrl: true,
      images: true,
      isActive: true,
    },
  });

  if (!dbProduct || !dbProduct.isActive) {
    return { title: "Producto no encontrado" };
  }

  const ogImage =
    dbProduct.images && dbProduct.images.length > 0
      ? dbProduct.images[0]
      : dbProduct.imageUrl || undefined;

  return {
    title: dbProduct.seoTitle ?? `${dbProduct.name} – RekaByte`,
    description:
      dbProduct.seoDescription ??
      dbProduct.shortDescription ??
      dbProduct.description ??
      dbProduct.name,
    openGraph: {
      title: dbProduct.seoTitle ?? `${dbProduct.name} – RekaByte`,
      description:
        dbProduct.seoDescription ??
        dbProduct.shortDescription ??
        dbProduct.description ??
        dbProduct.name,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}
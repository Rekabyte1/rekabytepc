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

  return (
    <main className="rb-container mx-auto max-w-7xl px-4 py-10 text-neutral-100">
      <div className="mb-4 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-200">
          Home
        </Link>{" "}
        <span className="mx-1">/</span>
        <Link href="/componentes" className="hover:text-neutral-200">
          Componentes
        </Link>{" "}
        <span className="mx-1">/</span>
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

      {premiumSections.length > 0 ? (
        <PremiumProductSections sections={premiumSections} />
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
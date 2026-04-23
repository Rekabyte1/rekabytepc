import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartButton from "@/components/AddToCartButton";

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
  return Object.entries(specs as Record<string, unknown>).map(([key, value]) => [
    key,
    String(value ?? ""),
  ]);
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
            <p className="text-3xl font-extrabold text-lime-400">
              {formatPrice(dbProduct.priceTransfer || dbProduct.price)}
            </p>

            <p className="mt-3 text-sm text-neutral-400">Otros medios de pago</p>
            <p className="text-xl font-bold text-white">
              {formatPrice(dbProduct.priceCard || dbProduct.price)}
            </p>
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
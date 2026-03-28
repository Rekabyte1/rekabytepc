import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: {
    q?: string;
  };
};

function clp(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default async function ProductosPage({ searchParams }: Props) {
  const q = searchParams?.q?.trim() || "";

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                brand: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                shortDescription: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      kind: true,
      price: true,
      priceCard: true,
      priceTransfer: true,
      imageUrl: true,
      stock: true,
      brand: true,
    },
  });

  return (
    <main className="rb-container py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">
        {q ? `Resultados para "${q}"` : "Productos"}
      </h1>

      {products.length === 0 ? (
        <p className="text-white/60">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const transferPrice =
              product.priceTransfer && product.priceTransfer > 0
                ? product.priceTransfer
                : product.price;

            const hasStock = (product.stock ?? 0) > 0;

            const href =
              product.kind === "UNIT_PRODUCT"
                ? `/producto/${product.slug}`
                : `/modelos/${product.slug}`;

            return (
              <Link
                key={product.id}
                href={href}
                className="block rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-lime-400/30 hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {product.brand ? (
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-white/40">
                        {product.brand}
                      </p>
                    ) : null}

                    <h2 className="text-lg font-bold leading-tight text-white">
                      {product.name}
                    </h2>
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full border px-2 py-1 text-xs font-bold",
                      hasStock
                        ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300",
                    ].join(" ")}
                  >
                    {hasStock ? "Disponible" : "Agotado"}
                  </span>
                </div>

                <p className="mt-3 font-bold text-lime-400">
                  {clp(transferPrice)}
                </p>

                <div className="mt-4 overflow-hidden rounded-xl bg-white/5">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      className="h-[240px] w-full object-contain p-4"
                      alt={product.name}
                    />
                  ) : (
                    <div className="flex h-[240px] items-center justify-center text-sm text-white/40">
                      Sin imagen
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
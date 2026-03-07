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
            name: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      priceCard: true,
      priceTransfer: true,
      imageUrl: true,
      stock: true,
    },
  });

  return (
    <main className="rb-container py-10">
      <h1 className="text-3xl font-bold text-white mb-6">
        {q ? `Resultados para "${q}"` : "Productos"}
      </h1>

      {products.length === 0 ? (
        <p className="text-white/60">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => {
            const transferPrice =
              product.priceTransfer && product.priceTransfer > 0
                ? product.priceTransfer
                : product.price;

            const hasStock = (product.stock ?? 0) > 0;

            return (
              <Link
                key={product.id}
                href={`/modelos/${product.slug}`}
                className="block rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-lime-400/30 hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-white font-bold text-lg leading-tight">
                    {product.name}
                  </h2>

                  <span
                    className={[
                      "shrink-0 rounded-full px-2 py-1 text-xs font-bold border",
                      hasStock
                        ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300",
                    ].join(" ")}
                  >
                    {hasStock ? "Disponible" : "Agotado"}
                  </span>
                </div>

                <p className="text-lime-400 font-bold mt-3">
                  {clp(transferPrice)}
                </p>

                <div className="mt-4 rounded-xl bg-white/5 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      className="w-full h-[240px] object-contain p-4"
                      alt={product.name}
                    />
                  ) : (
                    <div className="h-[240px] flex items-center justify-center text-white/40 text-sm">
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
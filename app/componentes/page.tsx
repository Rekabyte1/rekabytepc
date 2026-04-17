// app/componentes/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getComponents() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      category: {
        in: [
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
        ],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      priceTransfer: true,
      stock: true,
      brand: true,
      shortDescription: true,
    },
  });
}

export default async function ComponentesHomePage() {
  const products = await getComponents();

  return (
    <main className="rb-container mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
        Componentes
      </h1>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 md:p-8">
          <p className="text-xs font-extrabold tracking-wide text-neutral-400">
            CATEGORÍA
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">
            Componentes
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
            Esta sección está en preparación. Por ahora aún no hay stock
            publicado, pero pronto iremos agregando productos por categoría.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-neutral-800 bg-black/20 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
            >
              Volver al inicio
            </Link>

            <Link
              href="/contacto"
              className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-lime-300"
            >
              Consultar disponibilidad
            </Link>
          </div>

          <div className="mt-6 h-[2px] w-full bg-lime-400/80" />
          <p className="mt-3 text-xs text-neutral-500">
            Tip: cuando cargues stock, esta vista se reemplaza por un listado.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-lime-400"
            >
              <img
                src={p.imageUrl || "/placeholder.jpg"}
                alt={p.name}
                className="mb-3 h-40 w-full rounded-md object-cover"
              />

              {p.brand ? (
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                  {p.brand}
                </p>
              ) : null}

              <h2 className="font-bold text-white">{p.name}</h2>

              {p.shortDescription ? (
                <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
                  {p.shortDescription}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-lime-400">
                  {p.priceTransfer?.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </p>

                {typeof p.stock === "number" && p.stock > 0 ? (
                  <span className="text-xs font-bold text-lime-300">
                    Stock: {p.stock}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-400">
                    Sin stock
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
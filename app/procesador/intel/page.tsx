// app/amd-ryzen/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getAmdProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      kind: "PREBUILT_PC",
      platformTag: "INTEL",
    },
    orderBy: [{ createdAt: "asc" }],
  });
}

export default async function AmdRyzenPage() {
  const products = await getAmdProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-neutral-100">
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
        PCs con procesador INTEL
      </h1>

      <p className="mb-8 text-neutral-400">
        Equipos optimizados con procesadores INTEL, productividad y uso diario.
      
      </p>

      {products.length === 0 ? (
        <p className="text-neutral-500">Aún no hay equipos disponibles.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-lime-400 transition"
            >
              <img
                src={p.imageUrl || "/placeholder.jpg"}
                alt={p.name}
                className="mb-3 h-40 w-full object-cover rounded-md"
              />

              <h2 className="font-bold text-white">{p.name}</h2>

              <p className="mt-2 text-sm text-neutral-400">
                Plataforma AMD Ryzen
              </p>

              <p className="mt-3 text-lime-400 font-extrabold">
                {p.priceTransfer?.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                })}
              </p>

              <p className="text-xs mt-1 text-neutral-500">
                Stock: {p.stock}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
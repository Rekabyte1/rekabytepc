// app/modelos/page.tsx
import type { Metadata } from "next";
import GameBuildCard from "@/components/GameBuildCard";
import type { Build, GameDef } from "@/data/games";
import { GAMES_ALL } from "@/data/games.extra";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Todos los modelos | RekaByte",
};

type Item = { key: string; build: Build; gameTitle: string };

/**
 * Lista blanca de configuraciones REALES por productSlug.
 */
const ALLOWED_SLUGS = new Set<string>([
  "oficina-8600g",
  "entrada-ryzen7-rtx5060",
  "media-ryzen9-rx9060xt",
]);

/** Reúne SOLO las builds reales (sin duplicados), conservando el título del juego. */
function collectRealBuilds(): Item[] {
  const picked = new Map<string, Item>(); // dedupe por productSlug

  (GAMES_ALL as GameDef[]).forEach((g) => {
    (["1080p", "1440p"] as const).forEach((res) => {
      const list = g.builds?.[res] ?? [];
      list.forEach((b) => {
        const slug = b?.productSlug;
        if (!slug) return;
        if (!ALLOWED_SLUGS.has(slug)) return;
        if (picked.has(slug)) return;

        picked.set(slug, {
          key: slug,
          build: b,
          gameTitle: g.title,
        });
      });
    });
  });

  return Array.from(picked.values());
}

export default async function ModelosPage() {
  // 1) Tomamos las builds “reales” (por slug) desde tus data files
  const items = collectRealBuilds();

  // 2) Buscamos esos slugs en la BD y armamos un map
  const slugs = items.map((x) => x.build.productSlug).filter(Boolean) as string[];

  const dbProducts = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      price: true,
      priceTransfer: true,
      priceCard: true,
      stock: true,
      isActive: true,
      imageUrl: true,
    },
  });

  const dbMap = new Map(dbProducts.map((p) => [p.slug, p]));

  // 3) “Pisamos” precios/stock del build con lo que viene de BD
  const merged: Item[] = items
    .map((row) => {
      const slug = row.build.productSlug;
      const db = slug ? dbMap.get(slug) : null;

      // si no existe en BD o está inactivo, igual lo mostramos pero con lo que venga del build
      if (!db || db.isActive === false) return row;

      const priceTransfer = db.priceTransfer ?? db.price ?? (row.build as any).priceTransfer ?? 0;
      const priceCard = db.priceCard ?? db.price ?? (row.build as any).priceCard ?? 0;

      // Para que el card pueda mostrar “agotado” si lo usas
      const stock = db.stock ?? null;
      const inStock = stock == null ? true : stock > 0;

      // Ojo: no mutamos el objeto original
      const build = {
        ...row.build,
        priceTransfer,
        priceCard,
        // algunos de tus componentes usan stock / inStock, otros no.
        // esto no rompe nada aunque no lo lean.
        stock,
        inStock,
        // si quieres que la imagen venga desde BD en vez del data file:
        image: db.imageUrl ?? (row.build as any).image,
      } as any as Build;

      return { ...row, build };
    })
    .sort((a, b) => ((a.build as any).priceTransfer ?? 0) - ((b.build as any).priceTransfer ?? 0));

  return (
    <main className="rb-container" data-models-page="1">
      <header className="models-hero">
        <div className="models-hero__inner">
          <div className="models-hero__kicker"></div>
          <h1 className="models-hero__title">Todos los modelos</h1>
          <p className="models-hero__sub">
            Mostrando <span className="models-hero__num">{merged.length}</span>{" "}
            configuraciones.
          </p>
        </div>
      </header>

      <section className="models-grid">
        {merged.map((row) => (
          <GameBuildCard key={row.key} build={row.build} gameTitle={row.gameTitle} />
        ))}
      </section>

      <div className="mb-16" />
    </main>
  );
}

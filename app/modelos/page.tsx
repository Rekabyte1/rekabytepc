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
 * Lista blanca de configuraciones PUBLICAS por productSlug.
 * Deja aquí solo los PCs reales que sí quieres mostrar en /modelos.
 */
const ALLOWED_SLUGS = new Set<string>([
  "pc-gamer-ryzen-5-5600gt-16GB-ddr4-ssd-1tb",
]);

/** Reúne SOLO las builds permitidas (sin duplicados), conservando el título del juego. */
function collectRealBuilds(): Item[] {
  const picked = new Map<string, Item>();

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
  const items = collectRealBuilds();
  const slugs = items.map((x) => x.build.productSlug).filter(Boolean) as string[];

  const dbProducts = slugs.length
    ? await prisma.product.findMany({
        where: {
          slug: { in: slugs },
          kind: "PREBUILT_PC",
          isActive: true,
        },
        select: {
          slug: true,
          price: true,
          priceTransfer: true,
          priceCard: true,
          stock: true,
          isActive: true,
          imageUrl: true,
        },
      })
    : [];

  const dbMap = new Map(dbProducts.map((p) => [p.slug, p]));

  const merged: Item[] = items
    .map((row) => {
      const slug = row.build.productSlug;
      const db = slug ? dbMap.get(slug) : null;

      // Si no existe en BD o está inactivo, no lo mostramos
      if (!db || db.isActive === false) return null;

      const priceTransfer =
        db.priceTransfer ?? db.price ?? (row.build as any).priceTransfer ?? 0;
      const priceCard =
        db.priceCard ?? db.price ?? (row.build as any).priceCard ?? 0;

      const stock = db.stock ?? null;
      const inStock = stock == null ? true : stock > 0;

      const build = {
        ...row.build,
        priceTransfer,
        priceCard,
        stock,
        inStock,
        image: db.imageUrl ?? (row.build as any).image,
      } as any as Build;

      return { ...row, build };
    })
    .filter((row): row is Item => row !== null)
    .sort(
      (a, b) =>
        ((a.build as any).priceTransfer ?? 0) -
        ((b.build as any).priceTransfer ?? 0)
    );

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
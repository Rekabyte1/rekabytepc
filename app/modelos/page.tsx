// app/modelos/page.tsx

import type { Metadata } from "next";
import GameBuildCard from "@/components/GameBuildCard";
import type { Build, GameDef } from "@/data/games";
import { GAMES_ALL } from "@/data/games.extra";

export const metadata: Metadata = {
  title: "Todos los modelos | RekaByte",
};

type Item = { key: string; build: Build; gameTitle: string };

/**
 * Lista blanca de configuraciones REALES por productSlug.
 * Agrega/quita aquí los slugs de tus builds reales.
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

  const out = Array.from(picked.values());
  out.sort((a, b) => (a.build.priceTransfer ?? 0) - (b.build.priceTransfer ?? 0));
  return out;
}

export default function ModelosPage() {
  const items = collectRealBuilds();

  return (
    <main className="rb-container" data-models-page="1">
      <header className="models-hero">
        <div className="models-hero__inner">
          <div className="models-hero__kicker">MODELOS</div>
          <h1 className="models-hero__title">Todos los modelos</h1>
          <p className="models-hero__sub">
            Mostrando <span className="models-hero__num">{items.length}</span>{" "}
            configuraciones.
          </p>
        </div>
      </header>

      <section className="models-grid">
        {items.map((row) => (
          <GameBuildCard
            key={row.key}
            build={row.build}
            gameTitle={row.gameTitle}
          />
        ))}
      </section>

      <div className="mb-16" />
    </main>
  );
}

// app/modelos/page.tsx
export const metadata = {
  title: "Todos los modelos | RekaByte",
};

import GameBuildCard from "@/components/GameBuildCard";
import type { Build, GameDef } from "@/data/games";
import { GAMES_ALL } from "@/data/games.extra";

type Item = { key: string; build: Build; gameTitle: string };

/**
 * Lista blanca de configuraciones REALES por productSlug.
 * Agrega/quita aquí los slugs de tus builds reales (3–4 máximo por ahora).
 */
const ALLOWED_SLUGS = new Set<string>([
  "oficina-8600g",
  "entrada-ryzen7-rtx5060",
  "media-ryzen9-rx9060xt",
  // "tu-cuarta-build",  ← añade aquí cuando la tengas
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
        if (!ALLOWED_SLUGS.has(slug)) return; // filtra a solo reales
        if (picked.has(slug)) return;          // evita duplicados entre juegos

        picked.set(slug, {
          key: `${slug}`,          // clave estable por productSlug
          build: b,
          gameTitle: g.title,      // para la etiqueta de FPS por juego
        });
      });
    });
  });

  // Ordena de más barata a más cara por transferencia
  const out = Array.from(picked.values());
  out.sort(
    (a, b) => (a.build.priceTransfer ?? 0) - (b.build.priceTransfer ?? 0)
  );
  return out;
}

export default function ModelosPage() {
  const items = collectRealBuilds();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-1 text-3xl font-extrabold text-white">Todos los modelos</h1>
      <p className="text-neutral-400">Mostrando {items.length} configuraciones.</p>

      {/* Grilla compacta: 1 / 2 / 3 / 4 / 5 columnas */}
      <div className="mt-6 grid gap-6 grid-cols-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((row) => (
          <div key={row.key} className="min-w-0">
            <GameBuildCard build={row.build} gameTitle={row.gameTitle} />
          </div>
        ))}
      </div>
    </main>
  );
}

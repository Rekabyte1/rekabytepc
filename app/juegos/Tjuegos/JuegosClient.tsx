
'use client';

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/* ────────────────────────────────────────────────────────────
   Dataset de juegos (misma lógica tolerante a tus exportaciones)
   ──────────────────────────────────────────────────────────── */
type GameMeta = {
  slug: string;
  name?: string;
  title?: string;
  banner?: string;
  image?: string;
};

function readGames(): GameMeta[] {
  try {
    const mod: any = require("@/data/games");
    if (Array.isArray(mod?.GAMES)) return mod.GAMES;
    if (Array.isArray(mod?.default)) return mod.default;
    if (typeof mod?.getAllGames === "function") return mod.getAllGames();
  } catch {}
  return [];
}

/* ────────────────────────────────────────────────────────────
   Util: lee y escribe la resolución (res) en querystring
   ──────────────────────────────────────────────────────────── */
function useResolution() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const res = (sp.get("res") || "1080") as "1080" | "1440";

  function setRes(next: "1080" | "1440") {
    const params = new URLSearchParams(sp.toString());
    params.set("res", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return [res, setRes] as const;
}

/* ────────────────────────────────────────────────────────────
   Cliente (antes tu page)
   ──────────────────────────────────────────────────────────── */
export default function JuegosClient() {
  const GAMES = useMemo(readGames, []);
  const [res, setRes] = useResolution();

  const HERO = "/banners/todos-los-juegos-hero.jpg";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10">
      {/* Banner superior */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
        <div className="relative h-[280px] sm:h-[340px] md:h-[400px]">
          <Image
            src={HERO}
            alt="Todos los juegos"
            fill
            priority
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>

      {/* Selector de resolución */}
      <section className="mb-6">
        <h2 className="mb-3 text-center text-base font-semibold text-neutral-200">
          Seleccione la resolución de su monitor
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setRes("1080")}
            className={[
              "rounded-full px-5 py-3 text-sm font-semibold",
              "border transition-colors",
              res === "1080"
                ? "bg-lime-400 text-black border-lime-400"
                : "bg-neutral-900 text-neutral-200 border-neutral-700 hover:bg-neutral-800",
            ].join(" ")}
          >
            Full HD (1920 × 1080)
          </button>

          <button
            type="button"
            onClick={() => setRes("1440")}
            className={[
              "rounded-full px-5 py-3 text-sm font-semibold",
              "border transition-colors",
              res === "1440"
                ? "bg-lime-400 text-black border-lime-400"
                : "bg-neutral-900 text-neutral-200 border-neutral-700 hover:bg-neutral-800",
            ].join(" ")}
          >
            2K (2560 × 1440)
          </button>
        </div>
      </section>

      {/* Grilla de juegos */}
      <section>
        <h3 className="mb-4 text-center text-lg font-extrabold text-white">
          Elige tu juego favorito
        </h3>

        {GAMES.length === 0 ? (
          <p className="text-neutral-300">
            Aún no hay juegos cargados. Exporta tu arreglo desde{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5">/data/games.ts</code>.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {GAMES.map((g: GameMeta) => {
              const title = g.title || g.name || g.slug;
              const img = g.banner || g.image || "/game-placeholder.jpg";
              return (
                <li key={g.slug}>
                  <Link href={`/juegos/${g.slug}`} className="group block">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                      <Image
                        src={img}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-2 line-clamp-1 text-sm font-semibold text-white">
                      {title}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

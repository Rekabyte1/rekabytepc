"use client";

import { useState } from "react";
import type { GameDef, Resolution } from "@/data/games";
import GameBuildCard from "@/components/GameBuildCard";

const RESOS: Resolution[] = ["1080p", "1440p"];

type Props = { game: GameDef };

export default function GamePageClient({ game }: Props) {
  const [reso, setReso] = useState<Resolution>("1080p");
  const builds = game.builds[reso] ?? [];

  const showComingSoon = reso === "1440p" && builds.length === 0;

  return (
    <main className="rb-container relative" data-new-grid="1">
      {/* ✅ Anti-overlay: si tu CSS mete ::before/::after arriba, esto lo neutraliza */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      {/* Título + blurb */}
      <header className="relative z-10 mb-6 mt-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Computadoras para {game.title}
        </h1>
        <p className="mx-auto mt-2 max-w-3xl text-neutral-300">{game.blurb}</p>
      </header>

      {/* Banner */}
      {game.banner && (
        <div className="relative z-10 mb-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="relative h-[280px] sm:h-[340px] md:h-[380px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.banner}
              alt={`Computadoras para ${game.title}`}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {/* Degradé (solo visual, no bloquea clicks) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </div>
        </div>
      )}

      {/* Tabs de resolución */}
      <div className="relative z-10 mb-4 flex items-center justify-center gap-3">
        {RESOS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReso(r)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold border ${
              reso === r
                ? "bg-lime-400 text-black border-lime-400"
                : "bg-neutral-900/60 text-neutral-200 border-neutral-700 hover:bg-neutral-800"
            }`}
          >
            {r === "1080p"
              ? "Full HD (1920×1080)"
              : "2K (2560×1440) • Próximamente"}
          </button>
        ))}
      </div>

      {/* Grid de builds */}
      <section
        data-testid="new-grid"
        className="rb-grid relative z-10"
        // ✅ por si algún overlay está capturando eventos por arriba
        style={{ pointerEvents: "auto" }}
      >
        {showComingSoon ? (
          <div className="col-span-full rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center">
            <h3 className="mb-1 text-xl font-bold text-white">Próximamente</h3>
            <p className="text-neutral-300">
              Aún no hemos publicado configuraciones 2K para {game.title}.
            </p>
          </div>
        ) : (
          builds
            .slice(0, 3)
            .map((b, i) => (
              <GameBuildCard
                key={`${b.productSlug || b.title}-${i}`}
                build={b}
                gameTitle={game.title}
              />
            ))
        )}
      </section>
    </main>
  );
}

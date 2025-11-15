// components/AllGamesClient.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import GamePageClient from "@/components/GamePageClient";

// Ajusta el tipo si tienes definido `Game` en tu data/games
type Game = {
  slug: string;
  title: string;
  banner?: string;
  image?: string;
  // ...cualquier otro campo que uses en GamePageClient
};

type Props = {
  games: Game[];
};

const RESOLUCIONES = [
  { key: "1080p", label: "Full HD (1920×1080)" },
  { key: "1440p", label: "2K (2560×1440)" },
];

export default function AllGamesClient({ games }: Props) {
  const list = useMemo(() => (Array.isArray(games) ? games : []), [games]);
  const first = list[0];

  const [selected, setSelected] = useState<Game | null>(first ?? null);
  const [res, setRes] = useState<"1080p" | "1440p">("1080p");

  return (
    <>
      {/* Selector de resolución */}
      <section className="mb-8">
        <h2 className="mb-3 text-center text-sm font-semibold text-neutral-300">
          Seleccione la resolución de su monitor
        </h2>
        <div className="flex items-center justify-center gap-3">
          {RESOLUCIONES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRes(r.key as "1080p" | "1440p")}
              className={[
                "rounded-full px-4 py-2 text-sm",
                res === r.key
                  ? "bg-lime-400/20 text-lime-400 ring-1 ring-lime-400"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
              ].join(" ")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de juegos */}
      <section>
        <h3 className="mb-4 text-center text-lg font-extrabold">
          Elige tu juego favorito
        </h3>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {list.map((g) => {
            const isActive = selected?.slug === g.slug;
            const cover =
              g.banner || g.image || `/games/${g.slug}.jpg` || "/game-placeholder.jpg";

            return (
              <li key={g.slug}>
                <button
                  type="button"
                  onClick={() => setSelected(g)}
                  className={[
                    "block w-full overflow-hidden rounded-xl border bg-neutral-950 text-left transition-all",
                    isActive
                      ? "border-lime-400 ring-2 ring-lime-400"
                      : "border-neutral-800 hover:border-neutral-700",
                  ].join(" ")}
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={cover}
                      alt={g.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="px-3 py-2 text-center text-sm font-medium">
                    {g.title}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Título + configuraciones del juego seleccionado */}
      {selected && (
        <section className="mt-10">
          <div className="mb-6 text-center text-2xl font-extrabold">
            Computadoras para{" "}
            <span className="text-lime-400">{selected.title}</span>
          </div>

          {/* Reutiliza tu componente existente de fichas/configuraciones */}
          {/* Si GamePageClient acepta un prop de resolución, pásalo aquí */}
          <GamePageClient key={selected.slug + res} game={selected as any} />
        </section>
      )}
    </>
  );
}

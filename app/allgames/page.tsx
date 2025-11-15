"use client";

import { useMemo, useRef, useState } from "react";
import GamePageClient from "@/components/GamePageClient";
import { GAMES_ALL as GAMES } from "@/data/games.extra"


// Catálogo de portadas (puedes cambiar paths/títulos cuando quieras)
const CATALOG = [
  { slug: "call-of-duty-warzone", title: "Call of Duty: Warzone", image: "/games/warzone.jpg" },
  { slug: "counter-strike-2",     title: "Counter-Strike 2",      image: "/games/cs2.jpg" },
  { slug: "minecraft",            title: "Minecraft",              image: "/games/minecraft.jpg" },
  { slug: "valorant",             title: "Valorant",               image: "/games/valorant.jpg" },
  { slug: "roblox",               title: "Roblox",                 image: "/games/roblox.jpg" },
  { slug: "rocket-league",        title: "Rocket League",          image: "/games/rocketleague.jpg" },
  { slug: "fortnite",             title: "Fortnite",               image: "/games/fortnite.jpg" },
  { slug: "triple-a",             title: "Juegos triple A",        image: "/games/triple-a.jpg" },
];

// Mini-componente con fallback si la imagen no existe
function Thumb({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? "/games/_placeholder.jpg" : src}
      alt={alt}
      onError={() => setErr(true)}
      width={320}
      height={180}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
    />
  );
}

export default function AllGamesPage() {
  const [selected, setSelected] = useState<string>("call-of-duty-warzone");
  const configRef = useRef<HTMLDivElement | null>(null);

  const game = useMemo(() => {
    const list = Array.isArray(GAMES) ? GAMES : [];
    return list.find((g) => g.slug === selected);
  }, [selected]);

  const onPick = (slug: string) => {
    setSelected(slug);
    queueMicrotask(() => {
      configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-2 text-center text-2xl font-extrabold">
          Ver todos los juegos
        </h1>

        {/* Grid de portadas */}
        <section className="mt-6">
          <h2 className="mb-4 text-center text-lg font-semibold text-neutral-200">
            Elige tu juego favorito
          </h2>

          <ul className="mx-auto grid max-w-5xl grid-cols-8 gap-5">
            {CATALOG.map((g) => {
              const isActive = g.slug === selected;
              return (
                <li key={g.slug}>
                  <button
                    onClick={() => onPick(g.slug)}
                    className={[
                      // TARJETA NEGRA
                      "group block w-full rounded-xl border border-neutral-800 bg-black transition",
                      isActive
                        ? "ring-2 ring-lime-400 border-lime-400"
                        : "hover:border-neutral-700 hover:bg-neutral-900",
                    ].join(" ")}
                    aria-pressed={isActive}
                  >
                    <div className="aspect-[16/9] overflow-hidden rounded-t-xl bg-black">
                      <Thumb src={g.image} alt={g.title} />
                    </div>
                    <div
                      className={[
                        "rounded-b-xl px-2 py-1.5 text-center text-xs font-medium",
                        isActive ? "bg-lime-500 text-black" : "text-neutral-200",
                      ].join(" ")}
                    >
                      {g.title}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Seleccionado */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-baseline gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm">
            <span className="text-neutral-300">Seleccionado:</span>
            <strong className="text-lime-400">
              {CATALOG.find((c) => c.slug === selected)?.title ?? "—"}
            </strong>
          </div>
        </div>

        {/* Configuraciones del juego activo */}
        <section ref={configRef} className="mt-10">
          {!game ? (
            <div className="mx-auto max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-neutral-300">
              <h3 className="mb-2 text-xl font-bold">Próximamente</h3>
              <p>
                Aún no hemos publicado las configuraciones para este juego. Cuando
                estén listas, aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <GamePageClient game={game} />
          )}
        </section>
      </div>
    </main>
  );
}

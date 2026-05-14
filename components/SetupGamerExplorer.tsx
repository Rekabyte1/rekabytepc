"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SetupTier = "SPAWN" | "LOADOUT" | "CLUTCH";
type SetupCategory = "MOUSE" | "KEYBOARD" | "KEYBOARD_MOUSE_COMBO";

type SetupProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  priceTransfer: number;
  stock: number | null;
  setupTier: SetupTier | null;
  setupCategory: SetupCategory | null;
};

const TIER_META: Record<SetupTier, { title: string; copy: string; banner: string }> = {
  SPAWN: {
    title: "Spawn",
    copy: "Tu primer setup gamer empieza aquí.",
    banner: "/banners/spawn.jpg",
  },
  LOADOUT: {
    title: "Loadout",
    copy: "Equilibrio entre rendimiento, comodidad y estética.",
    banner: "/banners/loadout.jpg",
  },
  CLUTCH: {
    title: "Clutch",
    copy: "Precisión, respuesta y control para jugar en serio.",
    banner: "/banners/clutch.jpg",
  },
};

const CATEGORY_FILTERS: Array<{ key: "ALL" | SetupCategory; label: string }> = [
  { key: "ALL", label: "Todos" },
  { key: "MOUSE", label: "Mouse" },
  { key: "KEYBOARD", label: "Teclados" },
  { key: "KEYBOARD_MOUSE_COMBO", label: "Combos" },
];

export default function SetupGamerExplorer({ products }: { products: SetupProduct[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tier = (searchParams.get("tier")?.toUpperCase() as SetupTier) || "SPAWN";
  const category = (searchParams.get("category")?.toUpperCase() as SetupCategory | "ALL") || "ALL";

  const activeTier = TIER_META[tier] ? tier : "SPAWN";

  const filtered = useMemo(() => {
    const tierList = products.filter((p) => p.setupTier === activeTier);
    if (category === "ALL") return tierList;
    return tierList.filter((p) => p.setupCategory === category);
  }, [products, activeTier, category]);

  const setParam = (next: { tier?: SetupTier; category?: "ALL" | SetupCategory }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.tier) params.set("tier", next.tier.toLowerCase());
    if (next.category) {
      if (next.category === "ALL") params.delete("category");
      else params.set("category", next.category);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="rb-container mx-auto max-w-7xl px-4 py-8 text-neutral-100">
      <h1 className="text-center text-3xl font-extrabold">Setup Gamer</h1>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {(Object.keys(TIER_META) as SetupTier[]).map((key) => {
          const isActive = key === activeTier;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setParam({ tier: key, category: "ALL" })}
              className={`group relative overflow-hidden rounded-2xl border text-left transition ${
                isActive
                  ? "border-lime-400 ring-1 ring-lime-400"
                  : "border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="relative h-52 md:h-56">
                <img
                  src={TIER_META[key].banner}
                  alt={TIER_META[key].title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-xl font-black text-white">{TIER_META[key].title}</div>
                  <p className="mt-1 text-sm text-neutral-200">{TIER_META[key].copy}</p>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => {
          const isActive = f.key === category;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setParam({ category: f.key })}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-lime-400 bg-lime-400 text-black"
                  : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </section>

      <section className="mt-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 text-center">
            <h3 className="text-xl font-extrabold text-white">Aún no hay productos asignados</h3>
            <p className="mt-2 text-neutral-300">Estamos preparando recomendaciones para este nivel y filtro.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link key={p.id} href={`/producto/${p.slug}`} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 hover:border-lime-400/70">
                <div className="mb-3 overflow-hidden rounded-xl bg-neutral-900">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                  )}
                </div>
                {p.brand ? <p className="text-xs font-bold uppercase text-neutral-400">{p.brand}</p> : null}
                <h3 className="mt-1 font-bold text-white">{p.name}</h3>
                {p.shortDescription ? <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{p.shortDescription}</p> : null}
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-extrabold text-lime-400">
                    {p.priceTransfer?.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
                  </p>
                  <span className={`text-xs font-bold ${typeof p.stock === "number" && p.stock > 0 ? "text-lime-300" : "text-red-400"}`}>
                    {typeof p.stock === "number" && p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
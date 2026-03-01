// app/juegos/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GAMES_ALL as GAMES } from "@/data/games.extra";
import GamePageClient from "@/components/GamePageClient";
import { prisma } from "@/lib/prisma";
import type { Build, GameDef, Resolution } from "@/data/games";

export const dynamic = "force-dynamic";

type PageProps = { params?: { slug?: string } };

function collectSlugsFromGame(game: GameDef): string[] {
  const slugs = new Set<string>();
  (["1080p", "1440p"] as Resolution[]).forEach((res) => {
    const list = game.builds?.[res] ?? [];
    list.forEach((b) => {
      if (b?.productSlug) slugs.add(b.productSlug);
    });
  });
  return Array.from(slugs);
}

function mergeGameWithDb(game: GameDef, dbMap: Map<string, any>): GameDef {
  const nextBuilds: GameDef["builds"] = {
    "1080p": [],
    "1440p": [],
  };

  (["1080p", "1440p"] as Resolution[]).forEach((res) => {
    const list = game.builds?.[res] ?? [];

    const mergedList = list
      .map((b) => {
        const slug = b?.productSlug;
        if (!slug) return b; // sin slug: lo dejamos tal cual (no debería pasar en tus builds reales)

        const db = dbMap.get(slug);

        // Si el producto existe y está inactivo, no lo mostramos en juegos
        if (db && db.isActive === false) return null;

        // Si no existe en BD, dejamos el placeholder (0)
        if (!db) return b;

        const priceTransfer =
          (db.priceTransfer ?? db.price ?? b.priceTransfer ?? 0) as number;
        const priceCard =
          (db.priceCard ?? db.price ?? b.priceCard ?? 0) as number;

        const stock = (db.stock ?? 0) as number;
        const inStock = stock > 0;

        // No mutamos el objeto original
        const build: Build & { inStock?: boolean } = {
          ...b,
          priceTransfer,
          priceCard,
          stock,
          inStock,
          // Si quieres que la imagen venga desde BD en vez del data file:
          // images: db.imageUrl ? [db.imageUrl] : b.images,
        };

        return build;
      })
      .filter(Boolean) as Build[];

    nextBuilds[res] = mergedList;
  });

  return { ...game, builds: nextBuilds };
}

// Página (Server Component)
export default async function Page({ params }: PageProps) {
  const slug = params?.slug ?? "";
  const list = Array.isArray(GAMES) ? (GAMES as GameDef[]) : [];
  const game = list.find((g) => g.slug === slug);

  if (!game) return notFound();

  // 1) Reunimos slugs usados por este juego
  const slugs = collectSlugsFromGame(game);

  // 2) Traemos productos reales desde BD
  const dbProducts = slugs.length
    ? await prisma.product.findMany({
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
      })
    : [];

  const dbMap = new Map(dbProducts.map((p) => [p.slug, p]));

  // 3) Merge (pisar placeholders con BD)
  const mergedGame = mergeGameWithDb(game, dbMap);

  return <GamePageClient game={mergedGame} />;
}

// Rutas estáticas (para slugs existentes)
// Ojo: esto solo define rutas; el render sigue siendo dinámico por stock/precios.
export function generateStaticParams() {
  const list = Array.isArray(GAMES) ? (GAMES as GameDef[]) : [];
  return list.map((g) => ({ slug: g.slug }));
}

// Metadata segura (dev/build a veces llama sin params)
export function generateMetadata({ params }: PageProps): Metadata {
  const slug = params?.slug ?? "";
  const list = Array.isArray(GAMES) ? (GAMES as GameDef[]) : [];
  const game = list.find((g) => g.slug === slug);

  if (!game) {
    return {
      title: "Juego no encontrado – RekaByte",
      description: "El juego solicitado no existe.",
    };
  }

  const title = `Computadoras para ${game.title} | RekaByte`;
  const description = game.blurb;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: game.banner ? [{ url: game.banner }] : [],
    },
  };
}
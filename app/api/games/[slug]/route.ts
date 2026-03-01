// app/api/games/[slug]/route.ts
import { NextResponse } from "next/server";
import { GAMES_ALL as GAMES } from "@/data/games.extra";
import type { GameDef, Resolution, Build } from "@/data/games";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function collectSlugsFromGame(game: GameDef): string[] {
  const slugs = new Set<string>();
  (["1080p", "1440p"] as Resolution[]).forEach((res) => {
    const list = game.builds?.[res] ?? [];
    list.forEach((b) => b?.productSlug && slugs.add(b.productSlug));
  });
  return Array.from(slugs);
}

function mergeGameWithDb(game: GameDef, dbMap: Map<string, any>): GameDef {
  const nextBuilds: GameDef["builds"] = { "1080p": [], "1440p": [] };

  (["1080p", "1440p"] as Resolution[]).forEach((res) => {
    const list = game.builds?.[res] ?? [];
    const mergedList = list
      .map((b) => {
        const slug = b?.productSlug;
        if (!slug) return b;

        const db = dbMap.get(slug);

        // Si existe y está inactivo, ocultarlo en juegos
        if (db && db.isActive === false) return null;

        // Si no hay DB, dejar placeholder
        if (!db) return b;

        const priceTransfer =
          (db.priceTransfer ?? db.price ?? b.priceTransfer ?? 0) as number;
        const priceCard =
          (db.priceCard ?? db.price ?? b.priceCard ?? 0) as number;

        const stock = (db.stock ?? 0) as number;
        const inStock = stock > 0;

        const build: Build & { inStock?: boolean } = {
          ...b,
          priceTransfer,
          priceCard,
          stock,
          inStock,
        };

        return build;
      })
      .filter(Boolean) as Build[];

    nextBuilds[res] = mergedList;
  });

  return { ...game, builds: nextBuilds };
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params?.slug ?? "";
  const list = Array.isArray(GAMES) ? (GAMES as GameDef[]) : [];
  const game = list.find((g) => g.slug === slug);

  if (!game) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  const slugs = collectSlugsFromGame(game);

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
  const mergedGame = mergeGameWithDb(game, dbMap);

  return NextResponse.json({ ok: true, game: mergedGame });
}
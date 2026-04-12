import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModelClient from "./ui/modelclient";
import type { Build } from "@/data/games";
import { GAMES_ALL } from "@/data/games.extra";

const GAME_PRIORITY = [
  "fortnite",
  "valorant",
  "roblox",
  "counter-strike-2",
];

function findBuildBySlug(slug: string): {
  build: Build;
  gameTitle?: string;
  gameSlug?: string;
} | null {
  const matches: Array<{
    build: Build;
    gameTitle?: string;
    gameSlug?: string;
  }> = [];

  for (const g of GAMES_ALL) {
    const allBuilds = [
      ...(g.builds["1080p"] ?? []),
      ...(g.builds["1440p"] ?? []),
    ];

    const hit = allBuilds.find((b) => b.productSlug === slug);
    if (hit) {
      matches.push({
        build: hit,
        gameTitle: g.title,
        gameSlug: g.slug,
      });
    }
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    const aIndex = GAME_PRIORITY.indexOf(a.gameSlug ?? "");
    const bIndex = GAME_PRIORITY.indexOf(b.gameSlug ?? "");

    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;

    return safeA - safeB;
  });

  return matches[0];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const found = findBuildBySlug(slug);

  if (!found) {
    return {
      title: "Modelo no encontrado | RekaByte",
      robots: { index: false, follow: false },
    };
  }

  const title = `${found.build.title} | RekaByte`;

  const description =
    `${found.build.title} es una configuración pensada para ${found.gameTitle ?? "gaming en 1080p"} en Chile. ` +
    `También ofrece buen desempeño en Counter-Strike 2, Valorant y Roblox, siendo una excelente opción para quienes buscan un PC equilibrado, listo para jugar y con posibilidad de futuras mejoras.`;

  const ogImage =
    found.build.images?.[0] && typeof found.build.images[0] === "string"
      ? [found.build.images[0]]
      : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage,
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const found = findBuildBySlug(slug);

  if (!found) return notFound();

  return (
    <ModelClient
      build={found.build}
      gameTitle={found.gameTitle}
      gameSlug={found.gameSlug}
    />
  );
}
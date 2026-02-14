import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModelClient from "./ui/modelclient";
import { GAMES, type Build } from "@/data/games";

function findBuildBySlug(slug: string): {
  build: Build;
  gameTitle?: string;
  gameSlug?: string;
} | null {
  for (const g of GAMES) {
    const allBuilds = [
      ...(g.builds["1080p"] ?? []),
      ...(g.builds["1440p"] ?? []),
    ];

    const hit = allBuilds.find((b) => b.productSlug === slug);
    if (hit) return { build: hit, gameTitle: g.title, gameSlug: g.slug };
  }
  return null;
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
  const description = found.build.fpsInfo
    ? `${found.build.title} — ${found.build.fpsInfo}.`
    : `${found.build.title} — PC armada lista para comprar.`;

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

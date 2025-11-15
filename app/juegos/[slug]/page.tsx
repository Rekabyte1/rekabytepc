// app/juegos/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GAMES_ALL as GAMES } from "@/data/games.extra"
import GamePageClient from "@/components/GamePageClient";

type PageProps = { params?: { slug?: string } };

// Página (Server Component)
export default function Page({ params }: PageProps) {
  const slug = params?.slug ?? "";
  const list = Array.isArray(GAMES) ? GAMES : [];
  const game = list.find((g) => g.slug === slug);

  if (!game) return notFound();
  return <GamePageClient game={game} />; // 👈 sin props extra
}

// Rutas estáticas (SSG)
export function generateStaticParams() {
  const list = Array.isArray(GAMES) ? GAMES : [];
  return list.map((g) => ({ slug: g.slug }));
}

// Metadata segura (dev/build a veces llama sin params)
export function generateMetadata({ params }: PageProps): Metadata {
  const slug = params?.slug ?? "";
  const list = Array.isArray(GAMES) ? GAMES : [];
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

import type { GameDef } from "./games";
import { GAMES as BASE_GAMES } from "./games";

/**
 * Importante:
 * - priceTransfer/priceCard/stock aquí quedan como placeholder (0).
 * - La UI (GameBuildCard) los reemplaza por los valores reales desde la BD
 *   usando el productSlug.
 */

const OFICINA = {
  productSlug: "oficina-8600g",
  title: "OFICINA – 8600G",
  images: [
    "/builds/shared/oficina.jpg",
    "/builds/shared/oficina.jpg",
    "/builds/shared/oficina.jpg",
  ],
  priceTransfer: 0,
  priceCard: 0,
  stock: 0,
  specs: [
    { label: "Tarjeta de video", value: "Integrada (RDNA3)" },
    { label: "CPU", value: "Ryzen 5 8600G" },
    { label: "Placa madre", value: "B650" },
    { label: "RAM", value: "2x16GB DDR5" },
    { label: "Unidad SSD", value: "NVMe 1 TB" },
    { label: "Fuente de poder", value: "650W 80+ Bronze" },
    { label: "Gabinete", value: "Micro-ATX" },
  ],
};

const ENTRADA = {
  productSlug: "entrada-ryzen7-rtx5060",
  title: "ENTRADA – Ryzen 7 + RTX 5060",
  images: [
    "/builds/shared/entrada.jpg",
    "/builds/shared/entrada.jpg",
    "/builds/shared/entrada.jpg",
  ],
  priceTransfer: 0,
  priceCard: 0,
  stock: 0,
  specs: [
    { label: "Tarjeta de video", value: "GeForce RTX 5060" },
    { label: "CPU", value: "Ryzen 7 (AM5)" },
    { label: "Placa madre", value: "B650" },
    { label: "RAM", value: "2x16GB DDR5" },
    { label: "Unidad SSD", value: "NVMe 1 TB" },
    { label: "Fuente de poder", value: "650W 80+ Bronze" },
    { label: "Gabinete", value: "ATX airflow" },
  ],
};

const MEDIA = {
  productSlug: "media-ryzen9-rx9060xt",
  title: "MEDIA – Ryzen 9 + RX 9060 XT",
  images: [
    "/builds/shared/media.jpg",
    "/builds/shared/media.jpg",
    "/builds/shared/media.jpg",
  ],
  priceTransfer: 0,
  priceCard: 0,
  stock: 0,
  specs: [
    { label: "Tarjeta de video", value: "Radeon RX 9060 XT" },
    { label: "CPU", value: "Ryzen 9 (AM5)" },
    { label: "Placa madre", value: "X670" },
    { label: "RAM", value: "2x16GB DDR5" },
    { label: "Unidad SSD", value: "NVMe 2 TB" },
    { label: "Fuente de poder", value: "850W 80+ Gold" },
    { label: "Gabinete", value: "ATX airflow" },
  ],
};

export const EXTRA_GAMES: GameDef[] = [
  {
    slug: "valorant",
    title: "Valorant",
    blurb: "Bajo input-lag y FPS estables para competir.",
    banner: "/banners/valorant.jpg",
    builds: {
      "1080p": [
        { ...ENTRADA, fpsInfo: "350 FPS • Config. Competitiva, FullHD" },
        { ...MEDIA, fpsInfo: "500 FPS • Config. Baja, FullHD" },
      ],
      "1440p": [],
    },
  },
  {
    slug: "roblox",
    title: "Roblox",
    blurb: "Equipos silenciosos y eficientes para Roblox y creación.",
    banner: "/banners/roblox.jpg",
    builds: {
      "1080p": [
        { ...OFICINA, fpsInfo: "160 FPS • FullHD" },
        { ...ENTRADA, fpsInfo: "240 FPS • FullHD" },
      ],
      "1440p": [],
    },
  },
  {
    slug: "rocket-league",
    title: "Rocket League",
    blurb: "144 Hz + entrada precisa: ideal para rankear.",
    banner: "/banners/rocketleague.jpg",
    builds: {
      "1080p": [
        { ...ENTRADA, fpsInfo: "230 FPS • 144 Hz, FullHD" },
        { ...MEDIA, fpsInfo: "300 FPS • 240 Hz, FullHD" },
      ],
      "1440p": [],
    },
  },
  {
    slug: "fortnite",
    title: "Fortnite",
    blurb: "Rendimiento competitivo con calidad muy alta.",
    banner: "/banners/fortnite.jpg",
    builds: {
      "1080p": [
        { ...OFICINA, fpsInfo: "120 FPS • Bajo/Medio, FullHD" },
        { ...ENTRADA, fpsInfo: "180 FPS • Alto, FullHD" },
        { ...MEDIA, fpsInfo: "240 FPS • Muy Alto, FullHD" },
      ],
      "1440p": [],
    },
  },
  {
    slug: "triple-a",
    title: "Juegos triple A",
    blurb:
      "Equipos preparados para campañas exigentes como Cyberpunk, RDR2, Starfield y más.",
    banner: "/banners/aaa.jpg",
    builds: {
      "1080p": [
        { ...ENTRADA, fpsInfo: "80 FPS • Alto, FullHD" },
        { ...MEDIA, fpsInfo: "120 FPS • Ultra, FullHD" },
      ],
      "1440p": [],
    },
  },
];

export const GAMES_ALL: GameDef[] = (() => {
  const map = new Map(BASE_GAMES.map((g) => [g.slug, g]));
  for (const g of EXTRA_GAMES) if (!map.has(g.slug)) map.set(g.slug, g);
  return Array.from(map.values());
})();

export function getGameBySlug(slug: string): GameDef | undefined {
  return GAMES_ALL.find((g) => g.slug === slug);
}

import type { GameDef } from "./games";
import { BUILD_R5_5600GT, GAMES as BASE_GAMES } from "./games";

/**
 * IMPORTANTE:
 * - Este archivo agrega juegos adicionales.
 * - Los builds de ejemplo se mantienen comentados.
 * - BUILD_R5_5600GT se importa desde ./games para mantener una sola fuente.
 */

/* ============================================================
   BUILDS EJEMPLO (COMENTADOS - NO ACTIVOS)
   ============================================================ */

/*
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
    { label: "Tarjeta de video", value: "Integrada (RDNA)" },
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
*/

/* ============================================================
   JUEGOS EXTRA
   ============================================================ */

export const EXTRA_GAMES: GameDef[] = [
  {
    slug: "valorant",
    title: "Valorant",
    blurb: "Bajo input-lag y FPS estables para competir.",
    banner: "/banners/valorant.jpg",
    builds: {
      "1080p": [
        {
          ...BUILD_R5_5600GT,
          fpsInfo: "Valorant: 100-140 FPS",
        },
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
        {
          ...BUILD_R5_5600GT,
          fpsInfo: "Roblox: rendimiento alto y estable",
        },
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
     "1080p": [],
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
        {
          ...BUILD_R5_5600GT,
          fpsInfo: "Fortnite: 50-70 FPS (modo rendimiento)",
        },
      ],
      "1440p": [],
    },
  },
  {
    slug: "triple-a",
    title: "Juegos triple A",
    blurb:"Equipos preparados para campañas exigentes como Cyberpunk, RDR2, Starfield y más.",
    banner: "/banners/AAA.jpg",
    builds: {
     "1080p": [],
     "1440p": [],
},
  },
];

/* ============================================================
   MERGE DE JUEGOS
   ============================================================ */

export const GAMES_ALL: GameDef[] = (() => {
  const map = new Map(BASE_GAMES.map((g) => [g.slug, g] as const));
  for (const g of EXTRA_GAMES) {
    if (!map.has(g.slug)) map.set(g.slug, g);
  }
  return Array.from(map.values());
})();

/* ============================================================
   HELPERS
   ============================================================ */

export function getGameBySlug(slug: string): GameDef | undefined {
  return GAMES_ALL.find((g) => g.slug === slug);
}
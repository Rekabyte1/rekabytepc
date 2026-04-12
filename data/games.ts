// /data/games.ts

export type Resolution = "1080p" | "1440p";

export type Spec = {
  label: string;
  value: string;
};

export type Build = {
  title: string;
  images: string[];
  priceTransfer: number;
  priceCard: number;
  productSlug: string;
  stock: number;
  specs: Spec[];
  fpsInfo?: string;
  videoUrl?: string;
};

export type GameDef = {
  slug: string;
  title: string;
  blurb: string;
  banner?: string;
  builds: Record<Resolution, Build[]>;
};

/* ============================================================
   BASE BUILDS (EJEMPLOS - NO ACTIVOS)
   ============================================================ */

// ⚠️ EJEMPLOS DE BUILDS (NO SE USAN EN LA WEB ACTUALMENTE)

/*
const BASE_OFICINA_8600G: Omit<Build, "fpsInfo"> = {
  title: "OFICINA – 8600G",
  images: ["/builds/oficina.jpg", "/builds/oficina2.jpg", "/builds/oficina3.jpg"],
  priceTransfer: 0,
  priceCard: 0,
  productSlug: "oficina-8600g",
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

const BASE_ENTRADA_R7_5060: Omit<Build, "fpsInfo"> = {
  title: "ENTRADA – Ryzen 7 + RTX 5060",
  images: ["/builds/entrada.jpg", "/builds/entrada.jpg", "/builds/entrada.jpg"],
  priceTransfer: 0,
  priceCard: 0,
  productSlug: "entrada-ryzen7-rtx5060",
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

const BASE_MEDIA_R9_9060XT: Omit<Build, "fpsInfo"> = {
  title: "MEDIA – Ryzen 9 + RX 9060 XT",
  images: ["/builds/media.jpg", "/builds/media.jpg", "/builds/media.jpg"],
  priceTransfer: 0,
  priceCard: 0,
  productSlug: "media-ryzen9-rx9060xt",
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
   BUILD REAL ACTIVO
   ============================================================ */

export const BUILD_R5_5600GT: Build = {
  title: "PC Gamer Ryzen 5 5600 GT 6 núcleos + 16GB RAM + 1 TB SSD",
  images: ["/builds/Antec1.jpg", "/builds/Antec2.jpg", "/builds/Antec3.jpg"],
  videoUrl: "/videos/pc-5600gt.mp4",
  priceTransfer: 750000,
  priceCard: 750000,
  productSlug: "pc-gamer-ryzen-5-5600gt-16GB-ddr4-ssd-1tb",
  stock: 1,
  specs: [
    { label: "Tarjeta de video", value: "Integrada Radeon Graphics Vega 7" },
    { label: "CPU", value: "AMD Ryzen 5 5600GT" },
    { label: "Placa madre", value: "Gigabyte A520M K V2" },
    { label: "RAM", value: "A-DATA XPG Spectrix D35G 16GB DDR4 (2x8) 3200MT/s" },
    { label: "Cooler", value: "AMD Cooler Stock" },
    { label: "Unidad SSD", value: "Kingston NV3 1 TB (SNV3S/1000G)" },
    { label: "Fuente de poder", value: "Gigabyte 650W PG5 Gold" },
    { label: "Windows", value: "Windows 11 pro sin activación" },
    {
      label: "Gabinete",
      value: "ANTEC VCX20M RGB ELITE (5 ventiladores)",
    },
  ],
};

/* ============================================================
   JUEGOS ACTIVOS
   ============================================================ */

export const GAMES: GameDef[] = [
  {
    slug: "counter-strike-2",
    title: "Counter-Strike 2",
    blurb:
      "FPS altos y latencia mínima para dominar cada ronda. Equipos listos para competir.",
    banner: "/banners/cs2.hero.jpg",
    builds: {
      "1080p": [
        {
          ...BUILD_R5_5600GT,
          fpsInfo: "CS2: 60-100 FPS (gráficos competitivos)",
        },
      ],
      "1440p": [],
    },
  },

  {
    slug: "call-of-duty-warzone",
    title: "Warzone",
    blurb:
      "Rendimiento estable y gráficos de alto nivel para competir en Verdansk y Rebirth.",
    banner: "/banners/callofduty.jpg",
    builds: {
      "1080p": [],
      "1440p": [],
    },
  },

  {
    slug: "minecraft",
    title: "Minecraft",
    blurb: "Desde vanilla hasta modpacks pesados, shaders y Ray Tracing.",
    banner: "/banners/maincra.jpg",
    builds: {
      "1080p": [],
      "1440p": [],
    },
  },
];
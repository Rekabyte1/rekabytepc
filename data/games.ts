// /data/games.ts

export type Resolution = "1080p" | "1440p";

export type Spec = {
  label: string;
  value: string;
};

export type Build = {
  title: string;
  images: string[];       // ← ahora 3 imágenes por config
  priceTransfer: number;
  priceCard: number;
  productSlug: string;    // clave para inventario compartido
  stock: number;          // (lo sobreescribe inventory.ts si lo usas)
  specs: Spec[];
  fpsInfo?: string;
};

export type GameDef = {
  slug: string;
  title: string;
  blurb: string;
  banner?: string;
  builds: Record<Resolution, Build[]>;
};

/* ============================================================
   BASE BUILDS (reales) – mismas specs para todos los juegos.
   Cambia imágenes y precios cuando tengas lo definitivo.
   ============================================================ */

const BASE_OFICINA_8600G: Omit<Build, "fpsInfo"> = {
  title: "OFICINA – 8600G",
  images: [
    "/builds/oficina.jpg",
    "/builds/oficina2.jpg",
    "/builds/oficina3.jpg",
  ],
  priceTransfer: 399000,
  priceCard: 429000,
  productSlug: "oficina-8600g",
  stock: 2,
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
  images: [
    "/builds/entrada.jpg",
    "/builds/entrada.jpg",
    "/builds/entrada.jpg",
  ],
  priceTransfer: 890000,
  priceCard: 930000,
  productSlug: "entrada-ryzen7-rtx5060",
  stock: 2,
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
  images: [
    "/builds/media.jpg",
    "/builds/media.jpg",
    "/builds/media.jpg",
  ],
  priceTransfer: 1490000,
  priceCard: 1550000,
  productSlug: "media-ryzen9-rx9060xt",
  stock: 2,
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

/* ============================================================
   JUEGOS BASE (Counter-Strike 2, Warzone, Minecraft)
   Compatibilidad = qué builds aparecen en cada juego.
   1440p vacío => "Próximamente".
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
        { ...BASE_ENTRADA_R7_5060, fpsInfo: "300 FPS • Config. Alta, FullHD" },
        { ...BASE_MEDIA_R9_9060XT, fpsInfo: "400 FPS • Config. Competitiva, FullHD" },
      ],
      "1440p": [
        /// Próximamente
      ],
    },
  },

  {
    slug: "call-of-duty-warzone",
    title: "Warzone",
    blurb:
      "Rendimiento estable y gráficos de alto nivel para competir en Verdansk y Rebirth.",
    banner: "/banners/callofduty.jpg",
    builds: {
      "1080p": [
        { ...BASE_ENTRADA_R7_5060, fpsInfo: "160 FPS • Calidad Alta, FullHD" },
        { ...BASE_MEDIA_R9_9060XT, fpsInfo: "200 FPS • Calidad Muy Alta, FullHD" },
      ],
      "1440p": [
        /// Próximamente
      ],
    },
  },

  {
    slug: "minecraft",
    title: "Minecraft",
    blurb:
      "Desde vanilla hasta modpacks pesados, shaders y Ray Tracing.",
    banner: "/banners/maincra.jpg",
    builds: {
      "1080p": [
        { ...BASE_OFICINA_8600G, fpsInfo: "220 FPS • Vanilla, FullHD" },
        { ...BASE_ENTRADA_R7_5060, fpsInfo: "180 FPS • Modpacks, FullHD" },
        { ...BASE_MEDIA_R9_9060XT, fpsInfo: "160 FPS • Shaders/RT, FullHD" },
      ],
      "1440p": [
        /// Próximamente
      ],
    },
  },
];

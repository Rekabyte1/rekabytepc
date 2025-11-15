// components/games.ts

/* ========= Tipos ========= */

export type Resolution = "1080p" | "1440p" | "4k";

/** Tarjeta/PC para la lista de builds de un juego */
export type Build = {
  id?: string | number;
  title: string;
  image: string;           // ruta en /public (p.ej. "/pc1.jpg")
  status: "stock" | "pedido";
  priceText?: string;      // p.ej. "$890.000" o "desde $1.090.000"
  specs?: string[];        // lista de specs para mostrar en la tarjeta
  productSlug?: string;    // para el botón "Configurar y comprar": /producto/[productSlug]
  moreHref?: string;       // para el botón "Leer más"
  fpsInfo?: string;        // “chip” opcional (p.ej. "376 FPS • Counter-Strike 2")
  resolution?: Resolution; // si usas game.builds (en vez de buildsByReso)
};

export type GameDef = {
  slug: string;                  // /juegos/[slug]
  title: string;                 // nombre del juego
  blurb?: string;                // texto corto debajo del título
  banner?: string;               // imagen de portada por juego (ruta /public)
  // dos maneras de entregar builds (elige UNA):
  // (A) por resolución en objeto:
  buildsByReso?: Partial<Record<Resolution, Build[]>>;
  // (B) un array plano con campo Build.resolution:
  builds?: Build[];
};

/* ========= Datos de ejemplo (cámbialos cuando quieras) =========
   Usa imágenes que tengas en /public. Si ya tienes /pc1.jpg, /pc2.jpg, /pc3.jpg
   y /banners/banner-1.jpg etc., déjalo así. Si no, cambia las rutas por las que tengas. */

const CS2_1080: Build[] = [
  {
    id: "cs2-1",
    title: "JUGAR 5",
    image: "/pc1.jpg",
    status: "stock",
    priceText: "$890.000",
    specs: [
      "GeForce RTX 4060",
      "Intel Core i5",
      "16GB DDR5",
      "SSD NVMe 1TB",
    ],
    productSlug: "cs2-jugar-5",
    moreHref: "#",
    fpsInfo: "376 FPS • Counter-Strike 2",
  },
  {
    id: "cs2-2",
    title: "JUGAR 5",
    image: "/pc2.jpg",
    status: "pedido",
    priceText: "desde $1.280.000",
    specs: [
      "GeForce RTX 4070",
      "Intel Core i5-12400F",
      "32GB DDR5",
      "SSD NVMe 1TB",
    ],
    productSlug: "cs2-jugar-5-pro",
    moreHref: "#",
    fpsInfo: "376 FPS • Counter-Strike 2",
  },
  {
    id: "cs2-3",
    title: "JUEGA 5 MÁS",
    image: "/pc3.jpg",
    status: "pedido",
    priceText: "desde $1.390.000",
    specs: [
      "GeForce RTX 4070",
      "Intel Core i5-14400F",
      "32GB DDR5",
      "SSD NVMe 1TB",
    ],
    productSlug: "cs2-juega-5-mas",
    moreHref: "#",
    fpsInfo: "376 FPS • Counter-Strike 2",
  },
];

const WARZONE_1080: Build[] = [
  {
    id: "wz-1",
    title: "Warzone Base",
    image: "/pc1.jpg",
    status: "stock",
    priceText: "$890.000",
    specs: [
      "Hasta 180+ FPS en 1080p",
      "GeForce RTX 4060",
      "Intel Core i5",
      "16GB DDR5",
      "SSD NVMe 1TB",
    ],
    productSlug: "wz-base",
    moreHref: "#",
    fpsInfo: "180+ FPS • Warzone",
  },
  {
    id: "wz-2",
    title: "Warzone 1440p",
    image: "/pc2.jpg",
    status: "pedido",
    priceText: "desde $1.280.000",
    specs: [
      "1440p balanceado",
      "GeForce RTX 4070",
      "Intel Core i5-12400F",
      "32GB DDR5",
      "SSD NVMe 1TB",
    ],
    productSlug: "wz-1440p",
    moreHref: "#",
    fpsInfo: "1440p • Warzone",
  },
  {
    id: "wz-3",
    title: "JUEGA 5 MÁS",
    image: "/pc3.jpg",
    status: "pedido",
    priceText: "desde $1.390.000",
    specs: [
      "4K con DLSS/FG",
      "GeForce RTX 4070",
      "Intel Core i5-14400F",
      "32GB DDR5",
      "SSD NVMe 1TB",
    ],
    productSlug: "wz-4k",
    moreHref: "#",
    fpsInfo: "4K • Warzone",
  },
];

const MINECRAFT_1080: Build[] = [
  {
    id: "mc-1",
    title: "Vanilla",
    image: "/pc1.jpg",
    status: "stock",
    priceText: "$650.000",
    specs: [
      "Perfecto para vanilla y servidores",
      "GeForce GTX/RTX",
      "Intel Core i5",
      "16GB RAM",
      "SSD 1TB",
    ],
    productSlug: "mc-vanilla",
    moreHref: "#",
    fpsInfo: "Minecraft • Vanilla",
  },
  {
    id: "mc-2",
    title: "Modpacks",
    image: "/pc2.jpg",
    status: "pedido",
    priceText: "$980.000",
    specs: [
      "RAM adicional y CPU balanceada",
      "GeForce RTX 4060",
      "Ryzen 5",
      "32GB RAM",
      "SSD 1TB",
    ],
    productSlug: "mc-modpacks",
    moreHref: "#",
    fpsInfo: "Minecraft • Modpacks",
  },
  {
    id: "mc-3",
    title: "RT/Shaders",
    image: "/pc3.jpg",
    status: "pedido",
    priceText: "$1.350.000",
    specs: [
      "Ray Tracing y shaders a tope",
      "GeForce RTX 4070",
      "Ryzen 7",
      "32GB RAM",
      "SSD 1TB",
    ],
    productSlug: "mc-rt-shaders",
    moreHref: "#",
    fpsInfo: "Minecraft • Shaders",
  },
];

/* ========= Lista de juegos ========= */

export const GAMES: GameDef[] = [
  {
    slug: "counter-strike-2",
    title: "Counter-Strike 2",
    blurb:
      "FPS altos y latencia mínima para dominar cada ronda. Equipos balanceados para competir en 1080p, 1440p y 4K.",
    banner: "/banners/banner-1.jpg",
    buildsByReso: {
      "1080p": CS2_1080,
      // Si quieres, puedes duplicar o ajustar para "1440p" y "4k":
      "1440p": CS2_1080, // demo
      "4k": CS2_1080,    // demo
    },
  },
  {
    slug: "warzone",
    title: "Call of Duty: Warzone",
    blurb:
      "Configuraciones optimizadas para Warzone: rendimiento estable y gráficos de alto nivel.",
    banner: "/banners/banner-2.jpg",
    buildsByReso: {
      "1080p": WARZONE_1080,
      "1440p": WARZONE_1080, // demo
      "4k": WARZONE_1080,    // demo
    },
  },
  {
    slug: "minecraft",
    title: "Minecraft",
    blurb:
      "Desde vanilla hasta modpacks pesados, shaders y ray tracing.",
    banner: "/banners/banner-3.jpg",
    buildsByReso: {
      "1080p": MINECRAFT_1080,
      "1440p": MINECRAFT_1080, // demo
      "4k": MINECRAFT_1080,    // demo
    },
  },
];

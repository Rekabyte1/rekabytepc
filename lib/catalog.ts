import { prisma } from "@/lib/prisma";

export type Product = {
  id: string;
  slug: string;                // slug único del producto
  title: string;               // nombre comercial
  image: string;               // /pc/xxx.jpg (public)
  priceTransfer: number;       // ✅ viene de BD (o fallback)
  priceCard: number;           // ✅ viene de BD (o fallback)
  inStock: boolean;            // ✅ viene de BD (stock > 0) si existe
  gpu: string;
  cpu: string;
  motherboard: string;
  ram: string;
  cabinet: string;
  cabinetImage: string;
  games: string[];
  tasks: string[];
};

/**
 * ✅ CATÁLOGO “VISUAL/SPECS”
 * Mantén aquí specs, imágenes, agrupaciones, etc.
 * IMPORTANTE: el slug DEBE existir en la tabla Product (Supabase)
 */
export const PRODUCTS: Product[] = [
  {
    id: "p-jugar5",
    slug: "jugar-5",
    title: "JUGAR 5",
    image: "/pc/jugar5.jpg",
    priceTransfer: 890000,
    priceCard: 930000,
    inStock: true,
    gpu: "rtx-4060",
    cpu: "intel-i5-12400f",
    motherboard: "b660",
    ram: "16gb",
    cabinet: "cab-jugar",
    cabinetImage: "/cabinet/jugar.jpg",
    games: ["warzone", "valorant", "minecraft", "cs2", "dota2", "roblox"],
    tasks: ["juegos", "juegos-2k", "trabajar-estudiar"],
  },
  {
    id: "p-jugar7",
    slug: "jugar-7",
    title: "JUGAR 7",
    image: "/pc/jugar7.jpg",
    priceTransfer: 1275000,
    priceCard: 1349000,
    inStock: true,
    gpu: "rtx-4070",
    cpu: "intel-i5-14400f",
    motherboard: "b760",
    ram: "32gb",
    cabinet: "cab-jugar",
    cabinetImage: "/cabinet/jugar.jpg",
    games: ["warzone", "valorant", "cs2", "dota2"],
    tasks: ["juegos", "juegos-2k", "streaming"],
  },
  {
    id: "p-juega-x-plus",
    slug: "juega-x-plus",
    title: "JUEGA X PLUS",
    image: "/pc/juega-x-plus.jpg",
    priceTransfer: 1829000,
    priceCard: 1919000,
    inStock: true,
    gpu: "rtx-4070",
    cpu: "intel-i5-14400f",
    motherboard: "b760",
    ram: "32gb",
    cabinet: "cab-juega-x",
    cabinetImage: "/cabinet/juega-x.jpg",
    games: ["warzone", "cs2", "dota2"],
    tasks: ["juegos", "juegos-2k", "streaming"],
  },
  {
    id: "p-creadores",
    slug: "pc-para-creadores",
    title: "PC para Creadores",
    image: "/pc/creadores.jpg",
    priceTransfer: 1350000,
    priceCard: 1350000,
    inStock: true,
    gpu: "rtx-4060",
    cpu: "intel-i5-12400f",
    motherboard: "b660",
    ram: "32gb",
    cabinet: "cab-crea",
    cabinetImage: "/cabinet/crea.jpg",
    games: ["minecraft", "roblox"],
    tasks: ["trabajar-estudiar", "streaming"],
  },
  {
    id: "p-mc-rtx",
    slug: "mc-rtx",
    title: "MC – RTX",
    image: "/pc/mc-rtx.jpg",
    priceTransfer: 1190000,
    priceCard: 1240000,
    inStock: false,
    gpu: "rtx-3060",
    cpu: "ryzen-5-5600",
    motherboard: "b550",
    ram: "16gb",
    cabinet: "cab-mc",
    cabinetImage: "/cabinet/mc.jpg",
    games: ["minecraft", "roblox"],
    tasks: ["juegos", "trabajar-estudiar"],
  },
  {
    id: "p-juega5-mas",
    slug: "juega-5-mas",
    title: "JUEGA 5 MÁS",
    image: "/pc/juega5-mas.jpg",
    priceTransfer: 1397000,
    priceCard: 1440000,
    inStock: true,
    gpu: "rtx-4070",
    cpu: "intel-i5-14400f",
    motherboard: "b760",
    ram: "32gb",
    cabinet: "cab-juega5",
    cabinetImage: "/cabinet/juega5.jpg",
    games: ["warzone", "valorant", "cs2"],
    tasks: ["juegos", "streaming"],
  },
  {
    id: "p-wz-base",
    slug: "wz-base",
    title: "WZ – Base",
    image: "/pc/wz-base.jpg",
    priceTransfer: 999000,
    priceCard: 1049000,
    inStock: true,
    gpu: "rtx-4060",
    cpu: "ryzen-5-5600",
    motherboard: "b550",
    ram: "16gb",
    cabinet: "cab-wz",
    cabinetImage: "/cabinet/wz.jpg",
    games: ["warzone"],
    tasks: ["juegos"],
  },
  {
    id: "p-jugar5-eco",
    slug: "jugar-5-eco",
    title: "JUGAR 5 ECO",
    image: "/pc/jugar5-eco.jpg",
    priceTransfer: 890000,
    priceCard: 930000,
    inStock: true,
    gpu: "rtx-3060",
    cpu: "intel-i5-12400f",
    motherboard: "b660",
    ram: "16gb",
    cabinet: "cab-jugar",
    cabinetImage: "/cabinet/jugar.jpg",
    games: ["valorant", "minecraft", "roblox"],
    tasks: ["juegos", "trabajar-estudiar"],
  },
];

// ===== Juegos disponibles (para /juegos) =====
export const GAMES = [
  { slug: "warzone", name: "Call of Duty: Warzone", image: "/games/warzone.jpg" },
  { slug: "valorant", name: "Valorant", image: "/games/valorant.jpg" },
  { slug: "minecraft", name: "Minecraft", image: "/games/minecraft.jpg" },
  { slug: "cs2", name: "Counter-Strike 2", image: "/games/cs2.jpg" },
  { slug: "dota2", name: "Dota 2", image: "/games/dota2.jpg" },
  { slug: "roblox", name: "Roblox", image: "/games/roblox.jpg" },
];

// ===== Tareas (para /tareas/[slug]) =====
export const TASKS = [
  { slug: "trabajar-estudiar", name: "Trabajar y estudiar" },
  { slug: "juegos", name: "Juegos" },
  { slug: "streaming", name: "Streaming" },
  { slug: "juegos-2k", name: "Juegos en 2K" },
];

// ===== Helpers =====
export function unique<T extends keyof Product>(key: T): string[] {
  return Array.from(new Set(PRODUCTS.map((p) => p[key] as unknown as string))).sort();
}

export function byGame(slug: string) {
  return PRODUCTS.filter((p) => p.games.includes(slug));
}
export function byTask(slug: string) {
  return PRODUCTS.filter((p) => p.tasks.includes(slug));
}
export function byCabinet(slug: string) {
  return PRODUCTS.filter((p) => p.cabinet === slug);
}
export function byCPUFamily(slug: string) {
  if (slug === "intel") return PRODUCTS.filter((p) => p.cpu.startsWith("intel"));
  if (slug === "amd-ryzen") return PRODUCTS.filter((p) => p.cpu.startsWith("ryzen"));
  return [];
}
export function byGPUFamily(slug: string) {
  return PRODUCTS.filter((p) => p.gpu === slug);
}

export type StockFilter = {
  gpus: string[];
  cpus: string[];
  motherboards: string[];
  rams: string[];
  onlyStock: boolean;
  min?: number;
  max?: number;
  sort?: "price-asc" | "price-desc";
};

export function filterStock(f: StockFilter) {
  let list = [...PRODUCTS];

  if (f.onlyStock) list = list.filter((p) => p.inStock);
  if (f.gpus.length) list = list.filter((p) => f.gpus.includes(p.gpu));
  if (f.cpus.length) list = list.filter((p) => f.cpus.includes(p.cpu));
  if (f.motherboards.length) list = list.filter((p) => f.motherboards.includes(p.motherboard));
  if (f.rams.length) list = list.filter((p) => f.rams.includes(p.ram));
  if (f.min != null) list = list.filter((p) => p.priceTransfer >= f.min!);
  if (f.max != null) list = list.filter((p) => p.priceTransfer <= f.max!);

  if (f.sort === "price-asc") list.sort((a, b) => a.priceTransfer - b.priceTransfer);
  if (f.sort === "price-desc") list.sort((a, b) => b.priceTransfer - a.priceTransfer);

  return list;
}

/**
 * ✅ CAMINO B:
 * Devuelve el catálogo (specs) pero con precios/stock REALES desde BD.
 *
 * - Empareja por slug
 * - priceTransfer / priceCard vienen de Product.priceTransfer / Product.priceCard
 * - inStock se calcula con Product.stock (si existe), si no, mantiene el hardcode
 */
export async function getCatalogWithDb(): Promise<Product[]> {
  const slugs = PRODUCTS.map((p) => p.slug);

  const db = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      price: true,
      priceCard: true,
      priceTransfer: true,
      stock: true,
      isActive: true,
    },
  });

  const map = new Map(db.map((p) => [p.slug, p]));

  return PRODUCTS
    .map((p) => {
      const row = map.get(p.slug);
      if (!row || row.isActive === false) {
        // si no existe en BD, deja hardcode (o podrías ocultarlo)
        return p;
      }

      const priceTransfer = row.priceTransfer ?? row.price ?? p.priceTransfer ?? 0;
      const priceCard = row.priceCard ?? row.price ?? p.priceCard ?? 0;

      // stock real si existe
      const inStock = row.stock == null ? p.inStock : row.stock > 0;

      return {
        ...p,
        priceTransfer,
        priceCard,
        inStock,
      };
    })
    // opcional: esconder productos que no existan en BD
    // .filter((p) => map.has(p.slug))
    ;
}

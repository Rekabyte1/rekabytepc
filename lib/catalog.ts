// lib/catalog.ts
import { prisma } from "@/lib/prisma";
import { products as seedProducts } from "@/data/products";

export type Product = {
  id: string;
  slug: string;
  title: string;
  image: string;
  priceTransfer: number;
  priceCard: number;
  inStock: boolean;
  gpu: string;
  cpu: string;
  motherboard: string;
  ram: string;
  cabinet: string;
  cabinetImage: string;
  games: string[];
  tasks: string[];
};

const PREBUILT_META: Product[] = seedProducts
  .filter((p) => p.kind === "PREBUILT_PC")
  .map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.name,
    image: p.imageUrl ?? "/window.svg",
    priceTransfer: p.priceTransfer,
    priceCard: p.priceCard,
    inStock: (p.stock ?? 0) > 0,
    gpu: p.gpu ?? "",
    cpu: p.cpu ?? "",
    motherboard: p.motherboard ?? "",
    ram: p.ram ?? "",
    cabinet: p.cabinet ?? "",
    cabinetImage: p.cabinetImage ?? p.imageUrl ?? "/window.svg",
    games: p.games ?? [],
    tasks: p.tasks ?? [],
  }));

export const PRODUCTS = PREBUILT_META;

export const GAMES = [
  { slug: "call-of-duty-warzone", name: "Call of Duty: Warzone", image: "/banners/callofduty.jpg" },
  { slug: "counter-strike-2", name: "Counter-Strike 2", image: "/banners/cs2.hero.jpg" },
  { slug: "minecraft", name: "Minecraft", image: "/banners/maincra.jpg" },
  { slug: "fortnite", name: "Fortnite", image: "/banners/fortnite.jpg" },
  { slug: "roblox", name: "Roblox", image: "/banners/roblox.jpg" },
  { slug: "rocket-league", name: "Rocket League", image: "/banners/rocketleague.jpg" },
];

export const TASKS = [
  { slug: "trabajar-estudiar", name: "Trabajar y estudiar" },
  { slug: "juegos", name: "Juegos" },
  { slug: "streaming", name: "Streaming" },
  { slug: "juegos-2k", name: "Juegos en 2K" },
];

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
  if (slug === "amd-ryzen") return PRODUCTS.filter((p) => p.cpu.startsWith("amd-ryzen") || p.cpu.startsWith("ryzen"));
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
if (f.min != null) {
  const min = f.min;
  list = list.filter((p) => p.priceTransfer >= min);
}

if (f.max != null) {
  const max = f.max;
  list = list.filter((p) => p.priceTransfer <= max);
}
  if (f.sort === "price-asc") list.sort((a, b) => a.priceTransfer - b.priceTransfer);
  if (f.sort === "price-desc") list.sort((a, b) => b.priceTransfer - a.priceTransfer);

  return list;
}

export async function getCatalogWithDb(): Promise<Product[]> {
  const slugs = PRODUCTS.map((p) => p.slug);

  const db = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
    select: {
      slug: true,
      price: true,
      priceCard: true,
      priceTransfer: true,
      stock: true,
    },
  });

  const map = new Map(db.map((p) => [p.slug, p]));

  return PRODUCTS.map((p) => {
    const row = map.get(p.slug);
    if (!row) return p;

    return {
      ...p,
      priceTransfer: row.priceTransfer ?? row.price ?? p.priceTransfer,
      priceCard: row.priceCard ?? row.price ?? p.priceCard,
      inStock: (row.stock ?? 0) > 0,
    };
  });
}
// data/products.ts

export type Product = {
  id: string;
  title: string;
  desc: string;
  price: number;
  image: string;
  slug: string;
  stock: number;            // ← stock inicial de este producto
};

/**
 * Este catálogo es la “fuente de verdad” para:
 *  - Seed de Prisma (Supabase)
 *  - Inventario inicial (data/inventory.ts)
 *  - Listado “Todos los modelos”
 *
 * IMPORTANTE:
 *  - El slug debe coincidir con los productSlug de games.ts / games.extra.ts
 */

export const products: Product[] = [
  {
    id: "oficina-8600g",
    title: "OFICINA – 8600G",
    desc: "PC de oficina / uso general. Integrada RDNA3, Ryzen 5 8600G, 32GB RAM, NVMe 1TB.",
    price: 200000,                     // precio tarjeta (puedes ajustar)
    image: "/builds/oficina.jpg",
    slug: "oficina-8600g",
    stock: 5,                          // unidades iniciales
  },
  {
    id: "entrada-ryzen7-rtx5060",
    title: "ENTRADA – Ryzen 7 + RTX 5060",
    desc: "PC gamer de entrada con RTX 5060, Ryzen 7, 32GB RAM, NVMe 1TB.",
    price: 930000,
    image: "/builds/entrada.jpg",
    slug: "entrada-ryzen7-rtx5060",
    stock: 1,
  },
  {
    id: "media-ryzen9-rx9060xt",
    title: "MEDIA – Ryzen 9 + RX 9060 XT",
    desc: "PC gama media-alta con RX 9060 XT, Ryzen 9, 32GB RAM, NVMe 2TB.",
    price: 1550000,
    image: "/builds/media.jpg",
    slug: "media-ryzen9-rx9060xt",
    stock: 1,
  },
];

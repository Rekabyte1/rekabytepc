export type Product = {
  slug: string;
  name: string;
  priceText: string;
  image: string;
  shortDesc?: string;
  specs?: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "pc-gamer-ultra",
    name: "PC Gamer Ultra",
    priceText: "$1.200.000",
    image: "/builds/case-01.jpg",
    shortDesc: "RTX 4070, Ryzen 7, 32GB DDR5, 1TB NVMe.",
    specs: ["GeForce RTX 4070", "Ryzen 7", "32GB DDR5", "SSD NVMe 1TB"],
  },
  {
    slug: "pc-gamer-pro",
    name: "PC Gamer Pro",
    priceText: "$980.000",
    image: "/builds/case-02.jpg",
    shortDesc: "RTX 4060 Ti, Intel i5, 16GB DDR5, 1TB NVMe.",
    specs: ["GeForce RTX 4060 Ti", "Intel Core i5", "16GB DDR5", "SSD NVMe 1TB"],
  },
  {
    slug: "pc-creadores",
    name: "PC para Creadores",
    priceText: "$1.350.000",
    image: "/builds/case-03.jpg",
    shortDesc: "RTX 4070 Super, Ryzen 9, 32GB DDR5, 2TB NVMe.",
    specs: ["GeForce RTX 4070 Super", "Ryzen 9", "32GB DDR5", "SSD NVMe 2TB"],
  },
];

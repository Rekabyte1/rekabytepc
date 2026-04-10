import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rekabyte.cl";

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
    },
    {
      url: `${base}/modelos`,
      lastModified: new Date(),
    },
    {
      url: `${base}/componentes`,
      lastModified: new Date(),
    },

    // 🔥 TU PRODUCTO REAL
    {
      url: `${base}/modelos/pc-gamer-ryzen-5-5600gt-16gb-ddr4-ssd-1tb`,
      lastModified: new Date(),
    },
  ];
}
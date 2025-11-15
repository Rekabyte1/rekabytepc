import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rekabytepc.vercel.app';

  // Lista básica (agrega tus rutas clave)
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/juegos`, lastModified: new Date() },
    { url: `${base}/carrito`, lastModified: new Date() },
    // Si tienes productos dinámicos:
    // ...productos.map(p => ({ url: `${base}/producto/${p.slug}`, lastModified: p.updatedAt }))
  ];
}

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rekabytepc.vercel.app';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // Ejemplos de bloqueos:
      // { userAgent: '*', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}


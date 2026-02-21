// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // Si tienes otros hosts de imágenes, agrégalos aquí:
      // { protocol: "https", hostname: "res.cloudinary.com" },
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
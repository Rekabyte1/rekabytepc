// app/producto/[slug]/page.tsx
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { PRODUCTS } from "@/components/products";

type PageProps = { params: { slug: string } };

// Página de producto (Server Component)
export default function ProductPage({ params }: PageProps) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return notFound();
  return <ProductDetail product={product} />;
}

// (Opcional) rutas estáticas para SSG
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

// (Opcional) metadata por página
export function generateMetadata({ params }: PageProps) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: `${product.name} – RekaByte`,
    description: product.shortDesc ?? product.name,
    openGraph: {
      title: `${product.name} – RekaByte`,
      description: product.shortDesc ?? product.name,
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

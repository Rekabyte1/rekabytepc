// app/page.tsx
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";



export default function Home() {
  const slides = [
    { src: "/banners/banner-1.jpg", alt: "Promo RAM DDR5", href: "/productos" },
    { src: "/banners/banner-2.jpg", alt: "PC Gamer Serie 40", href: "/computadores" },
    { src: "/banners/banner-3.jpg", alt: "Líquida y RGB", href: "/servicios" },
    // Si por ahora solo tienes un banner, puedes dejar únicamente uno:
    // { src: "/banners/banner.jpg", alt: "Tu banner" },
  ];

  return (
    <main>
      {/* Título + carrusel de banners */}
      <h1 className="hero-title">
        Creamos computadoras potentes y de alta gama.
      </h1>

      <HeroSlider slides={slides} intervalMs={5000} className="mb-10" />

      {/* Gama de modelos */}
      <section className="section rb-container">
        <h2 className="section-title">Gama de modelos</h2>
        <div className="products-grid">
          <ProductCard
            id="pc-ultra"
            title="PC Gamer Ultra"
            desc="RTX 4070, Ryzen 7, 32GB RAM, 1TB NVMe."
            price="$1.200.000"
            image="/pc1.jpg"
          />
          <ProductCard
            id="pc-pro"
            title="PC Gamer Pro"
            desc="RTX 4060 Ti, Intel i5, 16GB RAM, 1TB NVMe."
            price="$980.000"
            image="/pc2.jpg"
          />
          <ProductCard
            id="pc-creators"
            title="PC para Creadores"
            desc="RTX 4070 Super, Ryzen 9, 32GB RAM, 2TB NVMe."
            price="$1.350.000"
            image="/pc3.jpg"
          />
        </div>
      </section>

      {/* Servicios */}
      <section className="section rb-container">
        <h2 className="section-title">Servicios</h2>
        <p className="text-center text-neutral-300 max-w-3xl mx-auto">
          Armado, pruebas de estrés, instalación de sistema, optimización y soporte.
        </p>
      </section>
    </main>
  );
}

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
      <h1 className="hero-title">Creamos computadoras potentes y de alta gama.</h1>

      <HeroSlider slides={slides} intervalMs={5000} className="mb-10" />


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

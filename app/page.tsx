// app/page.tsx
import HeroSlider from "@/components/HeroSlider";

export default function Home() {
  const slides = [
    { src: "/banners/banner-1.jpg", alt: "Promo RAM DDR5", href: "/productos" },
    { src: "/banners/banner-2.jpg", alt: "PC Gamer Serie 40", href: "/computadores" },
    { src: "/banners/banner-3.jpg", alt: "Líquida y RGB", href: "/servicios" },
  ];

  return (
    <main>
      {/* Título + carrusel */}
      <h1 className="hero-title">Rendimiento y estética en perfecto equilibrio</h1>
      <HeroSlider slides={slides} intervalMs={5000} className="mb-5" />

      {/* Placeholder (opcional) */}
      <section className="section rb-container">
        <h2 className="section-title">Catálogo</h2>
        <p className="text-center text-neutral-300">
          Próximamente subiremos los modelos. Si necesitas una cotización, contáctanos por WhatsApp.
        </p>
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

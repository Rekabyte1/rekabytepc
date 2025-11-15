"use client";

import { useEffect, useRef, useState } from "react";

type Slide = {
  src: string;
  alt?: string;
  href?: string; // opcional: si quieres que el banner lleve a un link
};

type Props = {
  slides: Slide[];
  intervalMs?: number; // default 5000
  className?: string;
};

export default function HeroSlider({
  slides,
  intervalMs = 5000,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const len = slides.length;
  const next = () => setIndex((i) => (i + 1) % len);
  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const goTo = (i: number) => setIndex(i % len);

  // Autoplay (pausa en hover)
  useEffect(() => {
    if (len <= 1 || isHover) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [index, isHover, len, intervalMs]);

  // Accesibilidad con teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Swipe en móviles
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    if (start == null) return;
    const end = e.changedTouches[0].clientX;
    const delta = end - start;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 ${className}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="Carrusel"
    >
      {/* Viewport */}
      <div className="relative h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden rounded-2xl border border-neutral-800/60 shadow-[0_10px_40px_rgba(0,0,0,.5)]">
        {/* Slides */}
        {slides.map((slide, i) => {
          const isActive = i === index;
          const content = (
            <img
              src={slide.src}
              alt={slide.alt ?? `Banner ${i + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              draggable={false}
            />
          );
          return (
            <div key={i} aria-hidden={!isActive}>
              {slide.href ? (
                <a href={slide.href} tabIndex={isActive ? 0 : -1}>
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}

        {/* Sombras de lectura suave */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/10" />

        {/* Flechas */}
        {len > 1 && (
          <>
            <button
              aria-label="Anterior"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 px-3 py-2 backdrop-blur text-white"
            >
              ‹
            </button>
            <button
              aria-label="Siguiente"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 px-3 py-2 backdrop-blur text-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {len > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir al banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index ? "bg-lime-400" : "bg-neutral-600 hover:bg-neutral-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

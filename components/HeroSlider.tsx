"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  src: string;
  alt?: string;
  href?: string;
};

type Props = {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
};

export default function HeroSlider({
  slides,
  intervalMs = 5000,
  className = "",
}: Props) {
  const safeSlides = useMemo(
    () => slides.filter((s) => typeof s?.src === "string" && s.src.trim().length > 0),
    [slides]
  );

  const [index, setIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const len = safeSlides.length;
  const canSlide = len > 1;

  const next = () => {
    if (!canSlide) return;
    setIndex((i) => (i + 1) % len);
  };

  const prev = () => {
    if (!canSlide) return;
    setIndex((i) => (i - 1 + len) % len);
  };

  const goTo = (i: number) => {
    if (!canSlide) return;
    setIndex(i % len);
  };

  useEffect(() => {
    if (index > len - 1) {
      setIndex(0);
    }
  }, [index, len]);

  useEffect(() => {
    if (!canSlide || isHover) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, intervalMs);

    return () => clearInterval(id);
  }, [canSlide, isHover, len, intervalMs]);

  useEffect(() => {
    if (!canSlide) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSlide, len]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!canSlide) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!canSlide) return;

    const start = touchStartX.current;
    if (start == null) return;

    const end = e.changedTouches[0].clientX;
    const delta = end - start;

    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }

    touchStartX.current = null;
  };

  if (len === 0) {
    return (
      <section className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 ${className}`}>
        <div className="relative h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-950 shadow-[0_10px_40px_rgba(0,0,0,.5)]">
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            Sin banners disponibles
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 ${className}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="Carrusel"
    >
      <div className="relative h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden rounded-2xl border border-neutral-800/60 shadow-[0_10px_40px_rgba(0,0,0,.5)]">
        {safeSlides.map((slide, i) => {
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
            <div key={`${slide.src}-${i}`} aria-hidden={!isActive}>
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/10" />

        {canSlide && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-black/60"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Siguiente"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-black/60"
            >
              ›
            </button>
          </>
        )}
      </div>

      {canSlide && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {safeSlides.map((_, i) => (
            <button
              key={i}
              type="button"
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